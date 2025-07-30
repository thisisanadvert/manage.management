import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import Button from '../ui/Button';
import { RTMMilestone, RTMEvidence } from '../../services/rtmTimelineService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface EvidenceUploadModalProps {
  stepId: string;
  stepTitle: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  uploaded: boolean;
  error?: string;
}

interface EvidenceFormData {
  document_type: string;
  document_title: string;
  document_description: string;
  service_date?: string;
  service_method?: string;
  recipient_name?: string;
  recipient_address?: string;
}

const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  stepId,
  stepTitle,
  onClose,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState<EvidenceFormData>({
    document_type: 'other',
    document_title: '',
    document_description: '',
    service_date: '',
    service_method: '',
    recipient_name: '',
    recipient_address: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'proof_of_postage', label: 'Proof of Postage' },
    { value: 'service_certificate', label: 'Service Certificate' },
    { value: 'claim_notice_copy', label: 'Claim Notice Copy' },
    { value: 'counter_notice', label: 'Counter Notice' },
    { value: 'companies_house_certificate', label: 'Companies House Certificate' },
    { value: 'bank_account_confirmation', label: 'Bank Account Confirmation' },
    { value: 'handover_documents', label: 'Handover Documents' },
    { value: 'other', label: 'Other' }
  ];

  const serviceMethods = [
    { value: 'recorded_delivery', label: 'Recorded Delivery' },
    { value: 'hand_delivery', label: 'Hand Delivery' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      uploaded: false
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFileToStorage = async (uploadFile: UploadFile): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const fileExt = uploadFile.file.name.split('.').pop();
    const fileName = `${user.id}/${stepId}/${uploadFile.id}.${fileExt}`;
    const filePath = `rtm-evidence/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, uploadFile.file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    return filePath;
  };

  const handleUpload = async () => {
    if (files.length === 0 || !formData.document_title.trim() || !user?.id) {
      alert('Please select files and provide a document title');
      return;
    }

    setUploading(true);

    try {
      for (const uploadFile of files) {
        if (uploadFile.uploaded) continue;

        try {
          // Upload file to storage
          const filePath = await uploadFileToStorage(uploadFile);

          // Create document record in main documents table
          const { data: documentData, error: docError } = await supabase
            .from('document_repository')
            .insert({
              building_id: user.metadata?.buildingId || user.id, // Use building ID if available
              title: formData.document_title,
              description: formData.document_description || `RTM Evidence: ${stepTitle}`,
              file_name: uploadFile.file.name,
              file_path: filePath,
              file_size: uploadFile.file.size,
              mime_type: uploadFile.file.type,
              category: 'Legal', // RTM evidence is legal documentation
              tags: [`rtm-${stepId}`, 'rtm-evidence', formData.document_type],
              uploaded_by: user.id,
              access_level: 'building',
              metadata: {
                rtm_step: stepId,
                step_title: stepTitle,
                document_type: formData.document_type,
                service_date: formData.service_date,
                service_method: formData.service_method,
                recipient_name: formData.recipient_name,
                recipient_address: formData.recipient_address
              }
            })
            .select()
            .single();

          if (docError) {
            throw docError;
          }

          // Also create RTM evidence record for timeline tracking
          const { error: evidenceError } = await supabase
            .from('rtm_timeline_evidence')
            .insert({
              user_id: user.id,
              step_id: stepId,
              document_id: documentData.id,
              document_type: formData.document_type,
              document_title: formData.document_title,
              document_description: formData.document_description,
              file_path: filePath,
              file_size: uploadFile.file.size,
              file_type: uploadFile.file.type,
              service_date: formData.service_date || null,
              service_method: formData.service_method || null,
              recipient_name: formData.recipient_name || null,
              recipient_address: formData.recipient_address || null,
              verified: false
            });

          if (evidenceError) {
            console.warn('Failed to create evidence record:', evidenceError);
            // Don't fail the upload if evidence record creation fails
          }

          // Update file status
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, uploaded: true, progress: 100 }
              : f
          ));

        } catch (error) {
          console.error('Error uploading file:', error);
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          ));
        }
      }

      // Check if all files uploaded successfully
      const allUploaded = files.every(f => f.uploaded);
      if (allUploaded) {
        onUploadComplete();
        onClose();
      }

    } catch (error) {
      console.error('Error in upload process:', error);
      alert('Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const isServiceRelated = ['proof_of_postage', 'service_certificate', 'claim_notice_copy'].includes(formData.document_type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Evidence</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Step Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{stepTitle}</h4>
            <p className="text-sm text-gray-600">Upload evidence documents for this RTM timeline step</p>
          </div>

          {/* Document Details Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={formData.document_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Claim Notice - Landlord Service"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.document_description}
                onChange={(e) => setFormData(prev => ({ ...prev, document_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Additional details about this document..."
              />
            </div>

            {/* Service-specific fields */}
            {isServiceRelated && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-3">Service Details</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Service Date
                    </label>
                    <input
                      type="date"
                      value={formData.service_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Method
                    </label>
                    <select
                      value={formData.service_method}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select method...</option>
                      {serviceMethods.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Name of person/organisation served"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Recipient Address
                  </label>
                  <textarea
                    value={formData.recipient_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient_address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Full address where document was served"
                  />
                </div>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files *
            </label>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files);
              }}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h4>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop files here, or click to select files
              </p>
              <Button variant="outline">
                Choose Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Selected Files</h5>
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{file.file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.uploaded && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {file.error && (
                      <AlertTriangle className="h-5 w-5 text-red-600" title={file.error} />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-600"
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={files.length === 0 || !formData.document_title.trim() || uploading}
              isLoading={uploading}
              className="flex-1"
            >
              Upload Evidence
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadModal;
