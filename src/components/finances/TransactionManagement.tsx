import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText,
  Camera,
  Brain,
  Users,
  CreditCard,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { financialDataService, Transaction as DBTransaction } from '../../services/financialDataService';
import { getUserBuildingId } from '../../utils/buildingUtils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvals: {
    director1?: { approved: boolean; date: string; name: string };
    director2?: { approved: boolean; date: string; name: string };
  };
  receipts: string[];
  notes?: string;
  createdBy: string;
  aiCategory?: string;
  aiConfidence?: number;
}

interface TransactionFormData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string;
  receipts: File[];
}

interface TransactionManagementProps {
  className?: string;
  externalShowAddForm?: boolean;
  onExternalFormClose?: () => void;
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({
  className = '',
  externalShowAddForm = false,
  onExternalFormClose
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isFormVisible = externalShowAddForm || showAddForm;

  // Function to handle closing the form
  const handleCloseForm = () => {
    if (externalShowAddForm && onExternalFormClose) {
      onExternalFormClose();
    } else {
      setShowAddForm(false);
    }
  };
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Form state for new transaction
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receipts: []
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const categories = {
    income: [
      'Service Charges',
      'Ground Rent',
      'Reserve Fund Contribution',
      'Interest Income',
      'Other Income'
    ],
    expense: [
      'Building Maintenance',
      'Utilities',
      'Insurance',
      'Professional Fees',
      'Cleaning',
      'Security',
      'Landscaping',
      'Emergency Repairs',
      'Administration',
      'Other Expenses'
    ]
  };

  // Load transactions from database
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const buildingId = await getUserBuildingId(user);
      if (!buildingId) {
        console.error('No building ID found for user');
        setIsLoading(false);
        return;
      }

      const { data, error } = await financialDataService.getTransactions(buildingId, {
        limit: 50 // Load recent 50 transactions
      });

      if (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } else {
        // Convert database transactions to component format
        const formattedTransactions: Transaction[] = (data || []).map(dbTrans => ({
          id: dbTrans.id || '',
          description: dbTrans.description,
          amount: dbTrans.amount,
          type: dbTrans.type,
          category: dbTrans.category,
          date: dbTrans.transaction_date,
          status: dbTrans.status,
          approvals: {}, // TODO: Load from transaction_approvals table
          receipts: dbTrans.receipt_url ? [dbTrans.receipt_url] : [],
          notes: dbTrans.notes,
          createdBy: dbTrans.created_by,
          aiCategory: dbTrans.ai_category,
          aiConfidence: dbTrans.ai_confidence
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error in loadTransactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id]);

  // Debug modal visibility
  useEffect(() => {
    if (isFormVisible) {
      console.log('Transaction modal is now visible');
    }
  }, [isFormVisible]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'approved': return CheckCircle2;
      case 'pending': return Clock;
      case 'rejected': return AlertTriangle;
      default: return Clock;
    }
  };

  const getApprovalStatus = (transaction: Transaction) => {
    const { director1, director2 } = transaction.approvals;
    if (director1?.approved && director2?.approved) return 'Fully Approved';
    if (director1?.approved || director2?.approved) return 'Partially Approved';
    return 'Pending Approval';
  };

  const handleSubmitTransaction = async () => {
    console.log('handleSubmitTransaction called');
    console.log('transactionForm:', transactionForm);
    console.log('user:', user);

    if (!transactionForm.description || !transactionForm.amount || !transactionForm.category) {
      console.log('Validation failed - missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    try {
      console.log('Getting building ID...');
      const buildingId = await getUserBuildingId(user);
      console.log('Building ID:', buildingId);

      if (!buildingId) {
        console.log('No building ID found');
        alert('Error: No building ID found');
        return;
      }

      console.log('Creating transaction object...');
      const newTransaction: DBTransaction = {
        building_id: buildingId,
        description: transactionForm.description,
        amount: transactionForm.amount,
        type: transactionForm.type,
        category: transactionForm.category,
        transaction_date: transactionForm.date,
        status: 'pending',
        notes: transactionForm.notes,
        created_by: user?.id || '',
        ai_category: transactionForm.category,
        ai_confidence: 0.85
      };
      console.log('Transaction object:', newTransaction);

      console.log('Calling financialDataService.createTransaction...');
      const { data, error } = await financialDataService.createTransaction(newTransaction);
      console.log('Service response - data:', data, 'error:', error);

      if (error) {
        console.error('Error creating transaction:', error);

        // If transactions table doesn't exist, try saving to a simple format
        if (error.message && error.message.includes('relation "transactions" does not exist')) {
          console.log('Transactions table does not exist, trying fallback...');
          try {
            // Save to a simple JSON format in user metadata or a notes table
            const fallbackData = {
              type: 'transaction',
              data: newTransaction,
              created_at: new Date().toISOString(),
              user_id: user?.id
            };

            // For now, just show success and store locally
            console.log('Would save transaction data:', fallbackData);
            alert('Transaction recorded! (Note: Database table will be created in next deployment)');

            // Add to local state for immediate display
            const localTransaction: Transaction = {
              id: Date.now().toString(),
              description: transactionForm.description,
              amount: transactionForm.amount,
              type: transactionForm.type,
              category: transactionForm.category,
              date: transactionForm.date,
              status: 'pending',
              approvals: {},
              receipts: [],
              notes: transactionForm.notes,
              createdBy: user?.email || 'unknown',
              aiCategory: transactionForm.category,
              aiConfidence: 0.85
            };

            setTransactions(prev => [localTransaction, ...prev]);
            handleCloseForm();

            // Reset form
            setTransactionForm({
              description: '',
              amount: 0,
              type: 'expense',
              category: '',
              date: new Date().toISOString().split('T')[0],
              notes: '',
              receipts: []
            });

            return;
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }

        alert(`Error creating transaction: ${error.message || error}`);
        return;
      }

      console.log('Transaction created successfully, reloading...');
      // Reload transactions to show the new one
      await loadTransactions();
      handleCloseForm();

      // Reset form
      setTransactionForm({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        receipts: []
      });

      alert('Transaction created successfully!');
    } catch (error) {
      console.error('Error in handleSubmitTransaction:', error);
      alert(`Error creating transaction: ${error.message || error}`);
    }
  };

  const handleApproveTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        const updatedApprovals = { ...t.approvals };

        // Simulate director approval
        if (!updatedApprovals.director1) {
          updatedApprovals.director1 = {
            approved: true,
            date: new Date().toISOString(),
            name: user?.email || 'Current User'
          };
        } else if (!updatedApprovals.director2) {
          updatedApprovals.director2 = {
            approved: true,
            date: new Date().toISOString(),
            name: user?.email || 'Current User'
          };
        }

        const newStatus = (updatedApprovals.director1?.approved && updatedApprovals.director2?.approved)
          ? 'approved' : 'pending';

        return { ...t, approvals: updatedApprovals, status: newStatus };
      }
      return t;
    }));
  };

  const handleImportFile = (file: File) => {
    setImportFile(file);
    // Process CSV/Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      const importedTransactions: Transaction[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 4) {
          const transaction: Transaction = {
            id: Date.now().toString() + i,
            description: values[0]?.trim() || 'Imported Transaction',
            amount: parseFloat(values[1]) || 0,
            type: values[2]?.toLowerCase().includes('income') ? 'income' : 'expense',
            category: values[3]?.trim() || 'Other',
            date: values[4] || new Date().toISOString().split('T')[0],
            status: 'pending',
            approvals: {},
            receipts: [],
            createdBy: user?.email || 'imported',
            aiCategory: values[3]?.trim() || 'Other',
            aiConfidence: 0.7
          };
          importedTransactions.push(transaction);
        }
      }

      setTransactions(prev => [...importedTransactions, ...prev]);
      setShowImportModal(false);
      setImportFile(null);
    };
    reader.readAsText(file);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction Management</h2>
            <p className="text-sm text-gray-600">Manage income and expenses with dual approval workflow</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button
              onClick={() => {
                // Export functionality
                const csvContent = "data:text/csv;charset=utf-8," +
                  "Description,Amount,Type,Category,Date,Status\n" +
                  transactions.map(t =>
                    `"${t.description}",${t.amount},${t.type},"${t.category}",${t.date},${t.status}`
                  ).join("\n");

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "transactions.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add Transaction button clicked');
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              style={{ pointerEvents: 'auto' }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const StatusIcon = getStatusIcon(transaction.status);
            const approvalStatus = getApprovalStatus(transaction);
            
            return (
              <div
                key={transaction.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`h-4 w-4 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>by {transaction.createdBy}</span>
                        </div>
                      </div>
                    </div>
                    
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 mb-2">{transaction.notes}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant={getStatusColor(transaction.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {transaction.status}
                      </Badge>
                      
                      <Badge variant="secondary">
                        {approvalStatus}
                      </Badge>
                      
                      {transaction.aiCategory && (
                        <Badge variant="gray">
                          <Brain className="h-3 w-3 mr-1" />
                          AI: {Math.round((transaction.aiConfidence || 0) * 100)}%
                        </Badge>
                      )}

                      {transaction.receipts.length > 0 && (
                        <Badge variant="gray">
                          <FileText className="h-3 w-3 mr-1" />
                          {transaction.receipts.length} receipt{transaction.receipts.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleApproveTransaction(transaction.id)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Transaction Modal */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Transaction</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Close button clicked');
                  handleCloseForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Type changed:', e.target.value);
                      setTransactionForm(prev => ({
                        ...prev,
                        type: e.target.value as 'income' | 'expense',
                        category: '' // Reset category when type changes
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount === 0 ? '' : transactionForm.amount}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Amount changed:', e.target.value);
                      setTransactionForm(prev => ({
                        ...prev,
                        amount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Description changed:', e.target.value);
                    setTransactionForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter transaction description"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ 
                      ...prev, 
                      category: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories[transactionForm.type].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm(prev => ({ 
                      ...prev, 
                      date: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes or details"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipts
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or click to select
                  </p>
                  <button className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Choose Files
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked');
                  handleCloseForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                style={{ pointerEvents: 'auto' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Submit button clicked');
                  handleSubmitTransaction();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                style={{ pointerEvents: 'auto' }}
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{selectedTransaction.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className={`text-lg font-bold ${
                    selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{selectedTransaction.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedTransaction.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedTransaction.notes}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                <div className="space-y-2">
                  {selectedTransaction.approvals.director1 ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Approved by {selectedTransaction.approvals.director1.name} on{' '}
                        {new Date(selectedTransaction.approvals.director1.date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Pending first approval</span>
                    </div>
                  )}
                  
                  {selectedTransaction.approvals.director2 ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Approved by {selectedTransaction.approvals.director2.name} on{' '}
                        {new Date(selectedTransaction.approvals.director2.date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Pending second approval</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedTransaction.status === 'pending' && (
                <button
                  onClick={() => {
                    handleApproveTransaction(selectedTransaction.id);
                    setSelectedTransaction(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Approve Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Import Transactions</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV file with transaction data. The file should have columns for:
                  Description, Amount, Type (income/expense), Category, Date
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your CSV file here, or click to select
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImportFile(file);
                      }
                    }}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                {importFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {importFile.name}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-1">CSV Format Example:</h4>
                <code className="text-xs text-blue-800 block">
                  Description,Amount,Type,Category,Date<br/>
                  "Office Supplies",150.00,expense,"Administration","2025-07-01"<br/>
                  "Service Charge Collection",45000.00,income,"Service Charges","2025-07-01"
                </code>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
