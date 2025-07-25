/**
 * MRI Section 20 Tracker Component
 * Tracks Section 20 compliance using MRI Qube diary integration
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Mail,
  Eye,
  Download,
  Plus,
  Filter
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MRIDataSourceIndicator } from '../mri/MRIDataSourceIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Section20Item {
  id: string;
  workDescription: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'planning' | 'consultation' | 'approved' | 'in_progress' | 'completed';
  consultationStartDate?: string;
  consultationEndDate?: string;
  approvalDate?: string;
  completionDate?: string;
  contractorName?: string;
  isMRIData: boolean;
  mriWorkOrderId?: string;
  lastSynced?: string;
  documents: {
    id: string;
    name: string;
    type: 'estimate' | 'notice' | 'response' | 'contract' | 'invoice';
    uploadDate: string;
    isMRIData: boolean;
  }[];
  consultationResponses: {
    unitNumber: string;
    response: 'approve' | 'object' | 'no_response';
    responseDate?: string;
    comments?: string;
  }[];
}

interface MRISection20TrackerProps {
  buildingId: string;
  className?: string;
}

const MRISection20Tracker: React.FC<MRISection20TrackerProps> = ({
  buildingId,
  className = ''
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Section20Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Items', count: 0 },
    { value: 'planning', label: 'Planning', count: 0 },
    { value: 'consultation', label: 'In Consultation', count: 0 },
    { value: 'approved', label: 'Approved', count: 0 },
    { value: 'in_progress', label: 'In Progress', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 }
  ];

  useEffect(() => {
    loadSection20Items();
  }, [buildingId]);

  const loadSection20Items = async () => {
    setIsLoading(true);
    try {
      // Load from both local and MRI sources
      const [localItems, mriWorkOrders, mriInvoices] = await Promise.all([
        supabase
          .from('section20_items')
          .select('*')
          .eq('building_id', buildingId),
        supabase
          .from('mri_maintenance')
          .select('*')
          .eq('building_id', buildingId)
          .gte('estimated_cost', 250), // Section 20 threshold
        supabase
          .from('mri_invoices')
          .select('*')
          .eq('building_id', buildingId)
          .gte('amount', 250)
      ]);

      const localData = localItems.data || [];
      const mriData = mriWorkOrders.data || [];
      const invoiceData = mriInvoices.data || [];

      // Convert local data
      const localSection20Items: Section20Item[] = localData.map(item => ({
        id: item.id,
        workDescription: item.work_description,
        estimatedCost: item.estimated_cost,
        actualCost: item.actual_cost,
        status: item.status,
        consultationStartDate: item.consultation_start_date,
        consultationEndDate: item.consultation_end_date,
        approvalDate: item.approval_date,
        completionDate: item.completion_date,
        contractorName: item.contractor_name,
        isMRIData: false,
        documents: item.documents || [],
        consultationResponses: item.consultation_responses || []
      }));

      // Convert MRI work orders to Section 20 items
      const mriSection20Items: Section20Item[] = mriData.map(workOrder => {
        // Map MRI status to Section 20 status
        let status: Section20Item['status'] = 'planning';
        switch (workOrder.status) {
          case 'open':
            status = 'planning';
            break;
          case 'in_progress':
            status = 'in_progress';
            break;
          case 'completed':
            status = 'completed';
            break;
        }

        return {
          id: `mri_${workOrder.id}`,
          workDescription: workOrder.description,
          estimatedCost: workOrder.estimated_cost || 0,
          actualCost: workOrder.actual_cost,
          status,
          contractorName: workOrder.assigned_to,
          isMRIData: true,
          mriWorkOrderId: workOrder.id,
          lastSynced: workOrder.synced_at,
          documents: [],
          consultationResponses: []
        };
      });

      const combinedItems = [...localSection20Items, ...mriSection20Items];
      setItems(combinedItems);

    } catch (error) {
      console.error('Error loading Section 20 items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Section20Item['status']) => {
    const statusConfig = {
      planning: { variant: 'gray' as const, label: 'Planning' },
      consultation: { variant: 'primary' as const, label: 'In Consultation' },
      approved: { variant: 'success' as const, label: 'Approved' },
      in_progress: { variant: 'primary' as const, label: 'In Progress' },
      completed: { variant: 'success' as const, label: 'Completed' }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getStatusIcon = (status: Section20Item['status']) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'consultation':
        return <Users className="h-4 w-4 text-primary-600" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-success-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-primary-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredItems = selectedStatus === 'all' 
    ? items 
    : items.filter(item => item.status === selectedStatus);

  // Update status counts
  const updatedStatusOptions = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? items.length 
      : items.filter(item => item.status === option.value).length
  }));

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading Section 20 data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Section 20 Compliance Tracker</h2>
          <p className="text-gray-600 mt-1">
            Monitor major works consultation and compliance requirements
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {items.filter(item => item.isMRIData).length} from MRI Qube
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddForm(true)}
          >
            Add Section 20 Item
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {updatedStatusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedStatus(option.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === option.value
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {option.label}
            <Badge variant="gray" size="xs">{option.count}</Badge>
          </button>
        ))}
      </div>

      {/* Section 20 Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.workDescription}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(item.status)}
                    <MRIDataSourceIndicator
                      isMRIData={item.isMRIData}
                      lastSynced={item.lastSynced}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(item.estimatedCost)}
                </p>
                {item.actualCost && (
                  <p className="text-sm text-gray-600">
                    Actual: {formatCurrency(item.actualCost)}
                  </p>
                )}
              </div>
            </div>

            {/* Consultation Timeline */}
            {item.status === 'consultation' && (
              <div className="mb-4 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-800">Consultation Period</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-700">Start Date:</span>
                    <p className="font-medium">{formatDate(item.consultationStartDate)}</p>
                  </div>
                  <div>
                    <span className="text-primary-700">End Date:</span>
                    <p className="font-medium">{formatDate(item.consultationEndDate)}</p>
                    {item.consultationEndDate && (
                      <p className="text-xs text-primary-600">
                        {getDaysRemaining(item.consultationEndDate)} days remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Key Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Contractor:</span>
                <p className="font-medium">{item.contractorName || 'Not assigned'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Approval Date:</span>
                <p className="font-medium">{formatDate(item.approvalDate)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Completion Date:</span>
                <p className="font-medium">{formatDate(item.completionDate)}</p>
              </div>
            </div>

            {/* Documents */}
            {item.documents.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {item.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-700">{doc.name}</span>
                      <MRIDataSourceIndicator
                        isMRIData={doc.isMRIData}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Responses */}
            {item.consultationResponses.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Consultation Responses</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-success-600">
                      {item.consultationResponses.filter(r => r.response === 'approve').length}
                    </p>
                    <p className="text-gray-600">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-error-600">
                      {item.consultationResponses.filter(r => r.response === 'object').length}
                    </p>
                    <p className="text-gray-600">Objections</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-600">
                      {item.consultationResponses.filter(r => r.response === 'no_response').length}
                    </p>
                    <p className="text-gray-600">No Response</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm" leftIcon={<Eye size={16} />}>
                View Details
              </Button>
              <Button variant="outline" size="sm" leftIcon={<FileText size={16} />}>
                Documents
              </Button>
              {item.status === 'consultation' && (
                <Button variant="outline" size="sm" leftIcon={<Mail size={16} />}>
                  Send Reminder
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Section 20 Items</h3>
          <p className="text-gray-600 mb-4">
            No Section 20 consultation items found for the selected status.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddForm(true)}
          >
            Add Section 20 Item
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MRISection20Tracker;
