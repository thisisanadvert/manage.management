import React, { useState, useEffect } from 'react';
import {
  BarChart4,
  DollarSign,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Upload,
  Mail,
  FileSpreadsheet,
  FileInput,
  TrendingUp,
  Building2,
  Settings,
  History,
  ChevronRight,
  Scale,
  Users,
  BookOpen
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import FinancialSetupModal from '../components/modals/FinancialSetupModal';
import FinancialOverview from '../components/finances/FinancialOverview';
import TransactionManagement from '../components/finances/TransactionManagement';
import { getUserBuildingId } from '../utils/buildingUtils';
import LegalGuidanceTooltip from '../components/legal/LegalGuidanceTooltip';
import ComplianceStatusIndicator from '../components/legal/ComplianceStatusIndicator';
import Section20Workflow from '../components/finances/Section20Workflow';

const Finances = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFinancialSetupModal, setShowFinancialSetupModal] = useState(false);
  const [showSection20Workflow, setShowSection20Workflow] = useState(false);
  const [showRecordTransaction, setShowRecordTransaction] = useState(false);
  const [financialSetup, setFinancialSetup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const isDirector = user?.role === 'rtm-director' || user?.role === 'rmc-director';

  // Check building association
  const checkBuildingAssociation = async () => {
    if (!user?.id) return;

    try {
      console.log('Checking building association for user:', user.id);

      const { data: buildingUsers, error } = await supabase
        .from('building_users')
        .select('building_id, role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking building association:', error);
      } else {
        console.log('Building associations found:', buildingUsers);
      }
    } catch (error) {
      console.error('Error in building association check:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkBuildingAssociation();
    }

    if (user?.metadata?.buildingId) {
      fetchFinancialSetup();
    }
  }, [user?.metadata?.buildingId, user?.id]);

  const fetchFinancialSetup = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching financial setup...');
      console.log('User role:', user?.role);
      console.log('User metadata:', user?.metadata);

      // Get the user's building ID, ensuring it's valid
      const buildingId = await getUserBuildingId(user);

      if (!buildingId) {
        console.log('No building found for user');
        setFinancialSetup(null);
        return;
      }

      console.log('Fetching financial setup for building:', buildingId);

      const { data, error } = await supabase
        .from('financial_setup')
        .select('*')
        .eq('building_id', buildingId);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Financial setup data:', data);

      if (data && data.length > 0) {
        setFinancialSetup(data[0]);
      } else {
        setFinancialSetup(null);
      }
    } catch (error: any) {
      console.error('Error fetching financial setup:', error.message || error);

      // If it's a permission error, try to provide more helpful feedback
      if (error.message && error.message.includes('row-level security')) {
        console.error('RLS Policy Error - User may not have proper building association');
        console.error('Building ID from metadata:', user?.metadata?.buildingId);
        console.error('User ID:', user?.id);
        console.error('User role:', user?.role);
      }

      setFinancialSetup(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    fetchFinancialSetup();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets & Planning' },
    { id: 'service-charges', label: 'Service Charges' },
    { id: 'section-20', label: 'Section 20 Consultations' },
    { id: 'reports', label: 'Reports & Analysis' }
  ];

  const ImportDataModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowImportModal(false)} />
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Import Historical Data</h2>
            
            {/* Manual Input */}
            <Card className="mb-4">
              <h3 className="font-medium flex items-center">
                <FileSpreadsheet className="mr-2 text-primary-600" size={20} />
                Manual Data Entry
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manually input historical financial records
              </p>
              <Button 
                variant="outline" 
                className="mt-3"
                leftIcon={<Plus size={16} />}
              >
                Add Transaction
              </Button>
            </Card>

            {/* Statement Upload */}
            <Card className="mb-4">
              <h3 className="font-medium flex items-center">
                <FileInput className="mr-2 text-secondary-600" size={20} />
                Statement Upload
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload bank statements or financial documents
              </p>
              <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop your statements here, or
                  </p>
                  <Button variant="ghost" className="mt-2">
                    Browse Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports PDF, CSV, XLS, XLSX (Max 10MB)
                  </p>
                </div>
              </div>
            </Card>

            {/* Request from Management */}
            <Card>
              <h3 className="font-medium flex items-center">
                <Mail className="mr-2 text-accent-600" size={20} />
                Request from Management
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Generate a formal request for historical statements
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Period Required
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <input
                      type="date"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Specify any particular requirements..."
                  />
                </div>
                <Button 
                  variant="primary"
                  leftIcon={<Mail size={16} />}
                >
                  Generate Request
                </Button>
              </div>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowImportModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-primary-100 p-4">
        <Wallet className="h-12 w-12 text-primary-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Set Up Financial Information</h2>
      <p className="mb-6 max-w-md text-gray-600">
        To get started with financial management, we need some basic information about your building's finances.
      </p>
      <Button 
        variant="primary"
        leftIcon={<Plus size={16} />}
        onClick={() => setShowFinancialSetupModal(true)}
      >
        Set Up Finances
      </Button>
    </div>
  );

  const renderFinancialDashboard = () => (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Service Charge Account</p>
              <h3 className="text-xl font-bold text-primary-900">{formatCurrency(financialSetup?.service_charge_account_balance || 0)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span className="text-success-600 ml-1">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card className="bg-success-50">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <PiggyBank className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Reserve Fund</p>
              <h3 className="text-xl font-bold text-success-900">{formatCurrency(financialSetup?.reserve_fund_balance || 0)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span className="text-success-600 ml-1">+8.2%</span>
            <span className="text-gray-500 ml-2">vs. budget</span>
          </div>
        </Card>

        <Card className="bg-warning-50">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <BarChart4 className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">Annual Budget</p>
              <h3 className="text-xl font-bold text-warning-900">{formatCurrency(financialSetup?.total_annual_budget || 0)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownRight className="h-4 w-4 text-warning-500" />
            <span className="text-warning-600 ml-1">-3.1%</span>
            <span className="text-gray-500 ml-2">vs. last year</span>
          </div>
        </Card>

        <Card className="bg-secondary-50">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Collection Frequency</p>
              <h3 className="text-xl font-bold text-secondary-900">{financialSetup?.service_charge_frequency || 'Quarterly'}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="h-4 w-4 text-secondary-500" />
            <span className="text-gray-500 ml-1">Next due in 14 days</span>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Track and manage building finances</p>
        </div>
        {isDirector && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<Upload size={16} />}
              onClick={() => setShowImportModal(true)}
            >
              Import Data
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => {
                setActiveTab('transactions');
                setShowRecordTransaction(true);
              }}
            >
              Record Transaction
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : !financialSetup ? (
        renderEmptyState()
      ) : (
        renderFinancialDashboard()
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {['month', 'quarter', 'year', 'custom'].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" leftIcon={<Settings size={16} />}>
            Settings
          </Button>
          <Button variant="outline" size="sm" leftIcon={<History size={16} />}>
            History
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <FinancialOverview onNavigateToTab={setActiveTab} />
      )}

      {activeTab === 'transactions' && (
        <TransactionManagement
          externalShowAddForm={showRecordTransaction}
          onExternalFormClose={() => setShowRecordTransaction(false)}
        />
      )}

      {/* Legacy Overview Content - Keep for other tabs */}
      {activeTab === 'legacy-overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legal Compliance Section */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Financial Compliance</h3>
                <LegalGuidanceTooltip
                  title="Financial Legal Obligations"
                  guidance={{
                    basic: "You must follow strict rules for service charges, including Section 20 consultations for major works over £250 per leaseholder.",
                    intermediate: "Key requirements include proper accounting, annual statements, consultation procedures, and transparent charging practices under LTA 1985.",
                    advanced: "Detailed compliance includes service charge demand procedures, trust accounting, consultation timelines, and potential liability for non-compliance."
                  }}
                  framework="LTA_1985"
                  mandatory={true}
                  externalResources={[
                    {
                      title: "LEASE Service Charges Guide",
                      url: "https://www.lease-advice.org/advice-guide/service-charges/",
                      type: "lease",
                      description: "Comprehensive guide to service charge legal requirements"
                    }
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ComplianceStatusIndicator
                status="compliant"
                title="Service Charge Demands"
                description="All demands properly issued"
                size="sm"
              />
              <ComplianceStatusIndicator
                status="at_risk"
                title="Section 20 Consultations"
                description="Review upcoming major works"
                size="sm"
              />
              <ComplianceStatusIndicator
                status="compliant"
                title="Annual Statements"
                description="Up to date and compliant"
                size="sm"
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'section-20' && !showSection20Workflow && (
        <div className="space-y-6">
          {/* Section 20 Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Section 20 Consultations</h2>
                <LegalGuidanceTooltip
                  title="Section 20 Consultation Requirements"
                  guidance={{
                    basic: "You must consult leaseholders before carrying out major works costing more than £250 per leaseholder or entering into long-term agreements.",
                    intermediate: "Follow the two-stage process: Notice of Intention (30 days), then Notice of Proposal with estimates (30 days). Failure to consult properly limits recoverable costs to £250 per leaseholder.",
                    advanced: "Comply with Service Charges (Consultation Requirements) (England) Regulations 2003. Consider dispensation applications to First-tier Tribunal if consultation not possible."
                  }}
                  framework="LTA_1985"
                  mandatory={true}
                  externalResources={[
                    {
                      title: "Section 20 Consultation Guide",
                      url: "https://www.lease-advice.org/advice-guide/section-20-consultation/",
                      type: "lease",
                      description: "Step-by-step guide to Section 20 consultations"
                    }
                  ]}
                />
              </div>
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowSection20Workflow(true)}
              >
                Start New Consultation
              </Button>
            </div>

            {/* Active Consultations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Active Consultations</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Roof Repairs - Major Works</h4>
                      <p className="text-sm text-gray-600">Estimated cost: £15,000 (£375 per leaseholder)</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="warning">Notice of Intention Sent</Badge>
                        <span className="text-sm text-gray-500">Responses due: 15 days</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Generate Notice</h4>
                    <p className="text-sm text-gray-600">Create Section 20 notices</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Legal Templates</h4>
                    <p className="text-sm text-gray-600">Access consultation templates</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Track Deadlines</h4>
                    <p className="text-sm text-gray-600">Monitor consultation timelines</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* Section 20 Workflow */}
      {activeTab === 'section-20' && showSection20Workflow && (
        <Section20Workflow onClose={() => setShowSection20Workflow(false)} />
      )}

      {/* Default content for other tabs */}
      {activeTab !== 'overview' && activeTab !== 'section-20' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {[
              {
                id: 1,
                description: "Emergency Plumbing Repair",
                amount: -850,
                date: "2025-04-15",
                status: "completed",
                category: "Maintenance"
              },
              {
                id: 2,
                description: "Q2 Service Charge Collection",
                amount: 12500,
                date: "2025-04-01",
                status: "completed",
                category: "Income"
              },
              {
                id: 3,
                description: "Building Insurance Premium",
                amount: -3200,
                date: "2025-03-28",
                status: "pending",
                category: "Insurance"
              }
            ].map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <Badge variant="gray" size="sm" className="ml-2">{transaction.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
                  </span>
                  <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                    {transaction.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 mr-1" />
                    )}
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">View All Transactions</Button>
        </Card>

        {/* Budget Overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Budget Overview</h2>
            <Button variant="ghost" size="sm" leftIcon={<FileText size={16} />}>
              Full Report
            </Button>
          </div>
          <div className="space-y-4">
            {[
              {
                category: "Building Maintenance",
                allocated: 45000,
                spent: 12500,
                type: "maintenance"
              },
              {
                category: "Improvements & Upgrades",
                allocated: 35000,
                spent: 8750,
                type: "improvement"
              },
              {
                category: "Insurance & Compliance",
                allocated: 15000,
                spent: 15000,
                type: "compliance"
              },
              {
                category: "Utilities",
                allocated: 25000,
                spent: 18750,
                type: "utilities"
              },
              {
                category: "Reserve Fund",
                allocated: 20000,
                spent: 20000,
                type: "reserve"
              }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-gray-600">
                    {item.spent.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} / {item.allocated.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (item.spent / item.allocated) > 0.9 
                        ? 'bg-error-500'
                        : (item.spent / item.allocated) > 0.7
                          ? 'bg-warning-500'
                          : 'bg-success-500'
                    }`}
                    style={{ width: `${(item.spent / item.allocated) * 100}%` }}
                  />
                </div>
                {(item.spent / item.allocated) > 0.9 && (
                  <div className="flex items-center text-sm text-error-600">
                    <AlertTriangle size={14} className="mr-1" />
                    <span>Over budget warning</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Major Works Section (conditionally rendered) */}
        {financialSetup?.has_major_works && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Planned Major Works</h2>
              <Badge variant="warning">Upcoming</Badge>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg border border-warning-100">
              <h3 className="font-medium text-warning-800">{financialSetup.major_works_description}</h3>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Estimated Cost</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(financialSetup.major_works_cost)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Reserve Fund Coverage</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round((financialSetup.reserve_fund_balance / financialSetup.major_works_cost) * 100)}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Funding Gap</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(Math.max(0, financialSetup.major_works_cost - financialSetup.reserve_fund_balance))}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Maintenance vs Improvement Analysis */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Expenditure Analysis</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                This Year
              </Button>
              <Button variant="outline" size="sm">
                Last Year
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Maintenance (Keeping Value)</h3>
              <div className="space-y-3">
                {[
                  { name: 'Regular Repairs', amount: 12500 },
                  { name: 'Preventive Maintenance', amount: 8500 },
                  { name: 'Emergency Fixes', amount: 4500 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="font-medium">
                      {item.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Improvements (Adding Value)</h3>
              <div className="space-y-3">
                {[
                  { name: 'Security Upgrades', amount: 15000 },
                  { name: 'Energy Efficiency', amount: 12000 },
                  { name: 'Facility Enhancements', amount: 8000 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="font-medium">
                      {item.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Investment</p>
                <p className="text-lg font-bold">£60,500</p>
              </div>
              <Button variant="outline" size="sm" rightIcon={<ChevronRight size={16} />}>
                View Details
              </Button>
            </div>
          </div>
        </Card>

        {/* Financial Health Indicators */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Financial Health</h2>
            <Badge variant="success">Good Standing</Badge>
          </div>
          <div className="space-y-4">
            {[
              {
                metric: "Service Charge Collection",
                value: "98%",
                target: "95%",
                status: "success"
              },
              {
                metric: "Reserve Fund Coverage",
                value: "8.5 months",
                target: "6 months",
                status: "success"
              },
              {
                metric: "Budget Variance",
                value: "-2.3%",
                target: "±5%",
                status: "success"
              },
              {
                metric: "Outstanding Payments",
                value: "£3,250",
                target: "< £5,000",
                status: "warning"
              }
            ].map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.metric}</p>
                    <p className="text-xs text-gray-500">Target: {item.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.value}</p>
                    <Badge variant={item.status} size="sm">
                      {item.status === 'success' ? 'On Track' : 'Monitor'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      )}

      {showImportModal && <ImportDataModal />}
      <FinancialSetupModal
        isOpen={showFinancialSetupModal}
        onClose={() => setShowFinancialSetupModal(false)}
        onSetupComplete={handleSetupComplete}
      />
    </div>
  );
};

export default Finances;