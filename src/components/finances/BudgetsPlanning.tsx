import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Calendar,
  PieChart,
  Target,
  AlertCircle,
  Save,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserBuildingId } from '../../utils/buildingUtils';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  quarterlyEstimate: number;
  annualEstimate: number;
  actualSpent: number;
  variance: number;
  type: 'income' | 'expense';
  notes: string;
  lastUpdated: string;
}

interface BudgetPeriod {
  id: string;
  year: number;
  quarter?: number;
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  status: 'draft' | 'approved' | 'active';
  createdBy: string;
  createdAt: string;
}

const BudgetsPlanning: React.FC = () => {
  const { user } = useAuth();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newBudgetItem, setNewBudgetItem] = useState({
    category: '',
    description: '',
    quarterlyEstimate: 0,
    annualEstimate: 0,
    type: 'expense' as 'income' | 'expense',
    notes: ''
  });

  const categories = {
    income: [
      'Service Charges',
      'Ground Rent',
      'Reserve Fund Interest',
      'Insurance Claims',
      'Other Income'
    ],
    expense: [
      'Building Insurance',
      'Cleaning & Maintenance',
      'Utilities',
      'Professional Fees',
      'Emergency Repairs',
      'Administration',
      'Reserve Fund Contributions',
      'Other Expenses'
    ]
  };

  useEffect(() => {
    loadBudgetData();
  }, [selectedYear, selectedQuarter]);

  const loadBudgetData = async () => {
    try {
      setIsLoading(true);
      const buildingId = await getUserBuildingId(user?.id);
      
      if (!buildingId) return;

      // Load budget items
      const { data: items, error: itemsError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('building_id', buildingId)
        .eq('year', selectedYear)
        .eq('quarter', selectedQuarter || null);

      if (itemsError) throw itemsError;

      // Load budget periods
      const { data: periods, error: periodsError } = await supabase
        .from('budget_periods')
        .select('*')
        .eq('building_id', buildingId)
        .eq('year', selectedYear)
        .order('quarter', { ascending: true });

      if (periodsError) throw periodsError;

      setBudgetItems(items || []);
      setBudgetPeriods(periods || []);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBudgetItem = async () => {
    try {
      const buildingId = await getUserBuildingId(user?.id);
      if (!buildingId) return;

      const itemData = {
        ...newBudgetItem,
        building_id: buildingId,
        year: selectedYear,
        quarter: selectedQuarter,
        actual_spent: 0,
        variance: 0,
        last_updated: new Date().toISOString(),
        created_by: user?.id
      };

      if (editingItem) {
        const { error } = await supabase
          .from('budget_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budget_items')
          .insert([itemData]);
        
        if (error) throw error;
      }

      setShowAddForm(false);
      setEditingItem(null);
      setNewBudgetItem({
        category: '',
        description: '',
        quarterlyEstimate: 0,
        annualEstimate: 0,
        type: 'expense',
        notes: ''
      });
      
      await loadBudgetData();
    } catch (error) {
      console.error('Error saving budget item:', error);
    }
  };

  const deleteBudgetItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadBudgetData();
    } catch (error) {
      console.error('Error deleting budget item:', error);
    }
  };

  const calculateTotals = () => {
    const income = budgetItems
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + (selectedQuarter ? item.quarterlyEstimate : item.annualEstimate), 0);
    
    const expenses = budgetItems
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + (selectedQuarter ? item.quarterlyEstimate : item.annualEstimate), 0);
    
    return { income, expenses, net: income - expenses };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Planning & Estimates</h2>
          <p className="text-gray-600 mt-1">
            Create and manage financial projections and budget estimates for planning purposes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Budget Item</span>
        </button>
      </div>

      {/* Period Selection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Planning Period</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedQuarter || ''}
              onChange={(e) => setSelectedQuarter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Annual Estimates</option>
              <option value="1">Q1 Estimates</option>
              <option value="2">Q2 Estimates</option>
              <option value="3">Q3 Estimates</option>
              <option value="4">Q4 Estimates</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Planning & Forecasting Tool</h4>
              <p className="text-sm text-blue-800 mt-1">
                This section is for creating financial estimates and projections. These are planning tools 
                and do not represent actual collected amounts or committed expenditures.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {selectedQuarter ? `Q${selectedQuarter} Income Estimate` : 'Annual Income Estimate'}
              </p>
              <p className="text-2xl font-bold text-green-600">£{totals.income.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calculator className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {selectedQuarter ? `Q${selectedQuarter} Expense Estimate` : 'Annual Expense Estimate'}
              </p>
              <p className="text-2xl font-bold text-red-600">£{totals.expenses.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${totals.net >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Position Estimate</p>
              <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                £{totals.net.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Items Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {selectedQuarter ? `Q${selectedQuarter} ${selectedYear}` : selectedYear} Budget Estimates
          </h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading budget data...</p>
          </div>
        ) : budgetItems.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No budget items created yet</p>
            <p className="text-sm text-gray-500">Start by adding your first budget estimate</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedQuarter ? 'Quarterly Estimate' : 'Annual Estimate'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={item.type === 'income' ? 'success' : 'warning'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      £{(selectedQuarter ? item.quarterlyEstimate : item.annualEstimate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setNewBudgetItem({
                              category: item.category,
                              description: item.description,
                              quarterlyEstimate: item.quarterlyEstimate,
                              annualEstimate: item.annualEstimate,
                              type: item.type,
                              notes: item.notes
                            });
                            setShowAddForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBudgetItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Budget Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setNewBudgetItem({
                    category: '',
                    description: '',
                    quarterlyEstimate: 0,
                    annualEstimate: 0,
                    type: 'expense',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
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
                    value={newBudgetItem.type}
                    onChange={(e) => setNewBudgetItem(prev => ({
                      ...prev,
                      type: e.target.value as 'income' | 'expense',
                      category: ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newBudgetItem.category}
                    onChange={(e) => setNewBudgetItem(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories[newBudgetItem.type].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newBudgetItem.description}
                  onChange={(e) => setNewBudgetItem(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quarterly Estimate (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBudgetItem.quarterlyEstimate === 0 ? '' : newBudgetItem.quarterlyEstimate}
                    onChange={(e) => setNewBudgetItem(prev => ({
                      ...prev,
                      quarterlyEstimate: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Estimate (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBudgetItem.annualEstimate === 0 ? '' : newBudgetItem.annualEstimate}
                    onChange={(e) => setNewBudgetItem(prev => ({
                      ...prev,
                      annualEstimate: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newBudgetItem.notes}
                  onChange={(e) => setNewBudgetItem(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or details"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setNewBudgetItem({
                    category: '',
                    description: '',
                    quarterlyEstimate: 0,
                    annualEstimate: 0,
                    type: 'expense',
                    notes: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveBudgetItem}
                disabled={!newBudgetItem.category || !newBudgetItem.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? 'Update' : 'Add'} Budget Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPlanning;
