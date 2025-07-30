import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  User,
  MapPin,
  Shield
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { RTMEvidence } from '../../services/rtmTimelineService';
import RTMTimelineService from '../../services/rtmTimelineService';
import { supabase } from '../../lib/supabase';

interface EvidenceListProps {
  stepId: string;
  evidence: RTMEvidence[];
  onEvidenceUpdate: () => void;
}

const EvidenceList: React.FC<EvidenceListProps> = ({
  stepId,
  evidence: initialEvidence,
  onEvidenceUpdate
}) => {
  const [evidence, setEvidence] = useState<RTMEvidence[]>(initialEvidence || []);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const timelineService = RTMTimelineService.getInstance();

  useEffect(() => {
    loadEvidence();
  }, [milestoneId]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const evidenceList = await timelineService.getEvidenceForMilestone(milestoneId);
      setEvidence(evidenceList);
    } catch (error) {
      console.error('Error loading evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId: string) => {
    setVerifying(evidenceId);
    try {
      const result = await timelineService.verifyEvidence(
        evidenceId,
        'current-user-id', // This should come from auth context
        'Evidence verified by RTM director'
      );

      if (result.success) {
        await loadEvidence();
        onEvidenceVerified?.();
      } else {
        alert(`Error verifying evidence: ${result.error}`);
      }
    } catch (error) {
      console.error('Error verifying evidence:', error);
      alert('Failed to verify evidence');
    } finally {
      setVerifying(null);
    }
  };

  const handleDownload = async (evidencePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(evidencePath);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'proof_of_postage': 'Proof of Postage',
      'service_certificate': 'Service Certificate',
      'claim_notice_copy': 'Claim Notice Copy',
      'counter_notice': 'Counter Notice',
      'companies_house_certificate': 'Companies House Certificate',
      'bank_account_confirmation': 'Bank Account Confirmation',
      'handover_documents': 'Handover Documents',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const getServiceMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      'recorded_delivery': 'Recorded Delivery',
      'hand_delivery': 'Hand Delivery',
      'email': 'Email',
      'other': 'Other'
    };
    return method ? methods[method] || method : '';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No evidence uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">{item.document_title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <Badge variant="secondary">
                    {getDocumentTypeLabel(item.document_type)}
                  </Badge>
                  {item.file_size && (
                    <span>{formatFileSize(item.file_size)}</span>
                  )}
                  <span>Uploaded {formatDate(item.created_at)}</span>
                </div>
                {item.document_description && (
                  <p className="text-sm text-gray-600 mb-2">{item.document_description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.verified ? (
                <Badge variant="success" className="flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified</span>
                </Badge>
              ) : (
                <Badge variant="warning" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Pending</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Service Details */}
          {(item.service_date || item.service_method || item.recipient_name) && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Service Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {item.service_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      <span className="text-gray-500">Date:</span> {formatDate(item.service_date)}
                    </span>
                  </div>
                )}
                {item.service_method && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      <span className="text-gray-500">Method:</span> {getServiceMethodLabel(item.service_method)}
                    </span>
                  </div>
                )}
                {item.recipient_name && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      <span className="text-gray-500">Recipient:</span> {item.recipient_name}
                    </span>
                  </div>
                )}
              </div>
              {item.recipient_address && (
                <div className="flex items-start space-x-2 mt-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <span className="text-gray-500">Address:</span> {item.recipient_address}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Verification Details */}
          {item.verified && item.verified_at && (
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Verification Details</span>
              </div>
              <div className="text-sm text-gray-700">
                <span className="text-gray-500">Verified on:</span> {formatDate(item.verified_at)}
              </div>
              {item.verification_notes && (
                <div className="text-sm text-gray-700 mt-1">
                  <span className="text-gray-500">Notes:</span> {item.verification_notes}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleDownload(item.file_path, item.document_title)}
              >
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye className="h-4 w-4" />}
                onClick={() => {
                  // Handle preview - could open in modal or new tab
                  console.log('Preview file:', item.file_path);
                }}
              >
                Preview
              </Button>
            </div>

            {canVerify && !item.verified && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => handleVerifyEvidence(item.id!)}
                isLoading={verifying === item.id}
                disabled={verifying !== null}
              >
                Verify
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvidenceList;
