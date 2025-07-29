import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Calendar, Bell, Filter, Eye, X, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ComplianceMonitoringService, { ComplianceDeadline, ComplianceAlert } from '../../services/complianceMonitoringService';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';

interface ComplianceMonitoringDashboardProps {
  userRole?: string;
}

const ComplianceMonitoringDashboard: React.FC<ComplianceMonitoringDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deadlines' | 'alerts' | 'settings'>('overview');
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [summary, setSummary] = useState({
    totalDeadlines: 0,
    upcomingDeadlines: 0,
    dueSoonDeadlines: 0,
    overdueDeadlines: 0,
    criticalAlerts: 0,
    warningAlerts: 0
  });
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);

  const monitoringService = ComplianceMonitoringService.getInstance();

  useEffect(() => {
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setDeadlines(monitoringService.getDeadlines());
    setAlerts(monitoringService.getUnacknowledgedAlerts());
    setSummary(monitoringService.getComplianceSummary());
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    monitoringService.acknowledgeAlert(alertId);
    loadData();
  };

  const handleCompleteDeadline = (deadlineId: string) => {
    monitoringService.completeDeadline(deadlineId);
    loadData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'error';
      case 'due_soon': return 'warning';
      case 'upcoming': return 'info';
      case 'completed': return 'success';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Active Deadlines</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalDeadlines}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-orange-600">{summary.dueSoonDeadlines}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{summary.overdueDeadlines}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(a => a.severity === 'critical').length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Critical Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => a.severity === 'critical').slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">{alert.title}</p>
                  <p className="text-sm text-red-700">{alert.message}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          <Button variant="outline" onClick={() => setActiveTab('deadlines')}>
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {deadlines.filter(d => d.status !== 'completed').slice(0, 5).map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{deadline.title}</p>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                  <Badge variant={getStatusColor(deadline.status) as any}>
                    {deadline.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Due: {deadline.dueDate.toLocaleDateString('en-GB')}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteDeadline(deadline.id)}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDeadlines = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Compliance Deadlines</h3>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Add Deadline
        </Button>
      </div>

      <div className="space-y-4">
        {deadlines.filter(d => d.status !== 'completed').map((deadline) => (
          <Card key={deadline.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{deadline.title}</h4>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                  <Badge variant={getStatusColor(deadline.status) as any}>
                    {deadline.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">{deadline.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Due: {deadline.dueDate.toLocaleDateString('en-GB')}</span>
                  <span>Framework: {deadline.framework}</span>
                  <span>Category: {deadline.category}</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCompleteDeadline(deadline.id)}
              >
                Mark Complete
              </Button>
            </div>

            {/* Actions */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Required Actions</h5>
              <div className="space-y-2">
                {deadline.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {action.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`text-sm ${action.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {action.title}
                    </span>
                    {action.dueDate && (
                      <span className="text-xs text-gray-500">
                        (Due: {action.dueDate.toLocaleDateString('en-GB')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Compliance Alerts</h3>
      
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`p-6 border-l-4 ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  {alert.actionRequired && (
                    <Badge variant="error">Action Required</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{alert.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {alert.createdAt.toLocaleDateString('en-GB')}</span>
                  <span>Framework: {alert.framework}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlert(alert)}
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Bell className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Monitoring</h2>
          <p className="text-gray-600 mt-1">
            Automated tracking of legal deadlines and compliance requirements
          </p>
        </div>
        <LegalGuidanceTooltip
          title="Compliance Monitoring"
          guidance={{
            basic: "Automated monitoring helps ensure you never miss critical legal deadlines for property management compliance.",
            intermediate: "The system tracks statutory requirements across multiple frameworks including LTA 1985, CLRA 2002, and BSA 2022.",
            advanced: "Comprehensive monitoring includes deadline tracking, alert generation, and automated compliance reporting for all legal obligations."
          }}
          framework="LTA_1985"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deadlines', label: 'Deadlines' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'settings', label: 'Settings' }
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
              {tab.id === 'alerts' && alerts.length > 0 && (
                <Badge variant="error" className="ml-2">
                  {alerts.length}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'deadlines' && renderDeadlines()}
      {activeTab === 'alerts' && renderAlerts()}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedAlert.title}</h4>
                <p className="text-gray-600 mt-1">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Severity:</span>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Framework:</span>
                  <span className="ml-2">{selectedAlert.framework}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2">{selectedAlert.createdAt.toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Action Required:</span>
                  <span className="ml-2">{selectedAlert.actionRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    handleAcknowledgeAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                >
                  Acknowledge Alert
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAlert(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComplianceMonitoringDashboard;
