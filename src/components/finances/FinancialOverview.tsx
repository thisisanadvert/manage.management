import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Calendar,
  FileText,
  ArrowRight,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import EnhancedServiceChargeWidget from './EnhancedServiceChargeWidget';
import EnhancedReserveFundWidget from './EnhancedReserveFundWidget';
import InteractiveCashflowChart from './InteractiveCashflowChart';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  variant: 'primary' | 'outline' | 'warning' | 'success';
  onClick: () => void;
}

interface ComplianceItem {
  id: string;
  title: string;
  status: 'compliant' | 'warning' | 'overdue';
  dueDate?: Date;
  description: string;
}

interface FinancialOverviewProps {
  onNavigateToTab?: (tabId: string) => void;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  onNavigateToTab
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDrillDown, setSelectedDrillDown] = useState<{
    month: string;
    transactions: any[];
  } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'chase-arrears',
      title: 'Chase Arrears',
      description: 'Send automated reminders to units with outstanding payments',
      icon: Users,
      variant: 'warning',
      onClick: () => onNavigateToTab?.('service-charges')
    },
    {
      id: 'emergency-payment',
      title: 'Emergency Payment',
      description: 'Process urgent payment for emergency works',
      icon: AlertTriangle,
      variant: 'primary',
      onClick: () => onNavigateToTab?.('transactions')
    },
    {
      id: 'export-summary',
      title: 'Export Summary',
      description: 'Download monthly financial summary report',
      icon: Download,
      variant: 'outline',
      onClick: () => {
        // Trigger export functionality
        console.log('Exporting financial summary...');
      }
    },
    {
      id: 'record-transaction',
      title: 'Record Transaction',
      description: 'Add new income or expense transaction',
      icon: Plus,
      variant: 'success',
      onClick: () => onNavigateToTab?.('transactions')
    }
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: 'annual-accounts',
      title: 'Annual Accounts Filing',
      status: 'warning',
      dueDate: new Date('2025-09-30'),
      description: 'Companies House annual accounts due'
    },
    {
      id: 'service-charge-certificates',
      title: 'Service Charge Certificates',
      status: 'compliant',
      description: 'All certificates issued and up to date'
    },
    {
      id: 'vat-return',
      title: 'VAT Return',
      status: 'warning',
      dueDate: new Date('2025-07-07'),
      description: 'Quarterly VAT return due'
    },
    {
      id: 'insurance-renewal',
      title: 'Insurance Renewal',
      status: 'overdue',
      dueDate: new Date('2025-06-15'),
      description: 'Building insurance policy renewal required'
    }
  ];

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'warning': return 'warning';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle2;
      case 'warning': return Calendar;
      case 'overdue': return AlertTriangle;
      default: return FileText;
    }
  };

  const handleCashflowDrillDown = (month: string, transactions: any[]) => {
    setSelectedDrillDown({ month, transactions });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedServiceChargeWidget
          onNavigateToFinances={() => onNavigateToTab?.('service-charges')}
          onNavigateToSection20={() => onNavigateToTab?.('section-20')}
        />
        <EnhancedReserveFundWidget
          onNavigateToCalculator={() => console.log('Open reserve fund calculator')}
          onNavigateToPlanning={() => onNavigateToTab?.('budgets')}
        />
      </div>

      {/* Interactive Cashflow Chart */}
      <InteractiveCashflowChart
        onDrillDown={handleCashflowDrillDown}
      />

      {/* Quick Actions Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <Badge variant="secondary">{quickActions.length} actions</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                onClick={action.onClick}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    action.variant === 'primary' ? 'bg-blue-100' :
                    action.variant === 'warning' ? 'bg-yellow-100' :
                    action.variant === 'success' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      action.variant === 'primary' ? 'text-blue-600' :
                      action.variant === 'warning' ? 'text-yellow-600' :
                      action.variant === 'success' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Compliance Dashboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Dashboard</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="warning">2 items need attention</Badge>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceItems.map((item) => {
            const Icon = getComplianceIcon(item.status);
            const statusColor = getComplianceStatusColor(item.status);
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-l-4 ${
                  item.status === 'compliant' ? 'border-green-500 bg-green-50' :
                  item.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${
                      item.status === 'compliant' ? 'text-green-600' :
                      item.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      {item.dueDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {item.dueDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={statusColor} size="sm">
                    {item.status === 'compliant' ? 'Compliant' :
                     item.status === 'warning' ? 'Due Soon' : 'Overdue'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Overall compliance score: <span className="font-medium">78%</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigateToTab?.('reports')}>
              View Full Report
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Drill-Down Modal */}
      {selectedDrillDown && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDrillDown.month} Transaction Details
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedDrillDown(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedDrillDown.transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <Badge variant={transaction.type === 'income' ? 'success' : 'danger'} size="sm">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedDrillDown(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => onNavigateToTab?.('transactions')}>
                View All Transactions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
