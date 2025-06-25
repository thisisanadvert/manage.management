import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, FileText, Gavel, Users, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalAccuracyService, { LegalReviewItem, LegislativeChange, ReviewProcess } from '../../services/legalAccuracyService';

interface LegalAccuracyDashboardProps {
  userRole?: string;
}

const LegalAccuracyDashboard: React.FC<LegalAccuracyDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'review-items' | 'legislative-changes' | 'processes'>('overview');
  const [reviewItems, setReviewItems] = useState<LegalReviewItem[]>([]);
  const [legislativeChanges, setLegislativeChanges] = useState<LegislativeChange[]>([]);
  const [reviewProcesses, setReviewProcesses] = useState<ReviewProcess[]>([]);
  const [summary, setSummary] = useState({
    totalReviewItems: 0,
    itemsNeedingReview: 0,
    pendingChanges: 0,
    overdueProcesses: 0,
    overallAccuracyScore: 100
  });

  const accuracyService = LegalAccuracyService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReviewItems(accuracyService.getAllReviewItems());
    setLegislativeChanges(accuracyService.getAllLegislativeChanges());
    setReviewProcesses(accuracyService.getAllReviewProcesses());
    setSummary(accuracyService.getAccuracySummary());
  };

  const handleUpdateReviewStatus = (id: string, status: LegalReviewItem['reviewStatus']) => {
    accuracyService.updateReviewItemStatus(id, status, 'Updated via dashboard');
    loadData();
  };

  const handleMarkChangeImplemented = (id: string) => {
    accuracyService.markLegislativeChangeImplemented(id);
    loadData();
  };

  const handleCompleteProcess = (id: string) => {
    accuracyService.completeReviewProcess(id);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'review_needed': return 'bg-yellow-100 text-yellow-800';
      case 'outdated': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Accuracy Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Legal Accuracy Score</h3>
              <p className="text-sm text-gray-700 mt-1">
                Overall compliance and accuracy of legal content
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              summary.overallAccuracyScore >= 90 ? 'text-green-600' :
              summary.overallAccuracyScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {summary.overallAccuracyScore}%
            </div>
            <div className="text-sm text-gray-600">Accuracy Rating</div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Review Items</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalReviewItems}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Review</p>
              <p className="text-2xl font-bold text-orange-600">{summary.itemsNeedingReview}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Changes</p>
              <p className="text-2xl font-bold text-purple-600">{summary.pendingChanges}</p>
            </div>
            <Gavel className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Processes</p>
              <p className="text-2xl font-bold text-red-600">{summary.overdueProcesses}</p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Priority Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Actions</h3>
        <div className="space-y-3">
          {accuracyService.getReviewItemsNeedingAttention().slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-900">{item.title}</p>
                <p className="text-sm text-yellow-700">Review due: {item.nextReviewDue.toLocaleDateString('en-GB')}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateReviewStatus(item.id, 'current')}
              >
                Mark Reviewed
              </Button>
            </div>
          ))}

          {accuracyService.getPendingLegislativeChanges().slice(0, 2).map((change) => (
            <div key={change.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">{change.title}</p>
                <p className="text-sm text-blue-700">Effective: {change.effectiveDate.toLocaleDateString('en-GB')}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleMarkChangeImplemented(change.id)}
              >
                Mark Implemented
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderReviewItems = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Legal Review Items</h3>
        <Button variant="primary">Add Review Item</Button>
      </div>

      <div className="space-y-4">
        {reviewItems.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                  <Badge className={getStatusColor(item.reviewStatus)}>
                    {item.reviewStatus.replace('_', ' ')}
                  </Badge>
                  <Badge className={getImpactColor(item.impactLevel)}>
                    {item.impactLevel}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Framework: {item.framework}</span>
                  <span>Version: {item.currentVersion}</span>
                  <span>Last Reviewed: {item.lastReviewed.toLocaleDateString('en-GB')}</span>
                  <span>Next Due: {item.nextReviewDue.toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateReviewStatus(item.id, 'under_review')}
                >
                  Start Review
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateReviewStatus(item.id, 'current')}
                >
                  Mark Current
                </Button>
              </div>
            </div>

            {item.relatedLegislation.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Related Legislation</h5>
                <div className="flex flex-wrap gap-2">
                  {item.relatedLegislation.map((law, idx) => (
                    <Badge key={idx} variant="outline">{law}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLegislativeChanges = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Legislative Changes</h3>

      <div className="space-y-4">
        {legislativeChanges.map((change) => (
          <Card key={change.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{change.title}</h4>
                  <Badge variant={change.status === 'implemented' ? 'success' : 'warning'}>
                    {change.status}
                  </Badge>
                  {change.actionRequired && (
                    <Badge variant="error">Action Required</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{change.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Framework: {change.framework}</span>
                  <span>Type: {change.changeType.replace('_', ' ')}</span>
                  <span>Effective: {change.effectiveDate.toLocaleDateString('en-GB')}</span>
                  <span>Source: {change.source}</span>
                </div>
              </div>
              {change.status !== 'implemented' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleMarkChangeImplemented(change.id)}
                >
                  Mark Implemented
                </Button>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-medium text-gray-900 mb-2">Impact Assessment</h5>
              <p className="text-sm text-gray-700 mb-3">{change.impactAssessment}</p>
              
              {change.affectedComponents.length > 0 && (
                <div>
                  <h6 className="font-medium text-gray-900 mb-2">Affected Components</h6>
                  <div className="flex flex-wrap gap-2">
                    {change.affectedComponents.map((component, idx) => (
                      <Badge key={idx} variant="outline">{component}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Only show to admin users
  if (userRole !== 'super-admin' && userRole !== 'legal-admin') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-gray-600">
          This section is only available to system administrators and legal team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Legal Accuracy Management</h2>
          <p className="text-gray-600 mt-1">
            Monitor and maintain legal accuracy across all compliance content
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'review-items', label: 'Review Items' },
            { id: 'legislative-changes', label: 'Legislative Changes' },
            { id: 'processes', label: 'Review Processes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'review-items' && summary.itemsNeedingReview > 0 && (
                <Badge variant="error" className="ml-2">
                  {summary.itemsNeedingReview}
                </Badge>
              )}
              {tab.id === 'legislative-changes' && summary.pendingChanges > 0 && (
                <Badge variant="warning" className="ml-2">
                  {summary.pendingChanges}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'review-items' && renderReviewItems()}
      {activeTab === 'legislative-changes' && renderLegislativeChanges()}
    </div>
  );
};

export default LegalAccuracyDashboard;
