/**
 * MRI Financial Dashboard Component
 * Enhanced financial dashboard that integrates MRI Qube data with local data
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText,
  Clock,
  Database
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MRIDataSourceIndicator, MRICardIndicator } from '../mri/MRIDataSourceIndicator';
import { getUserBuildingId } from '../../utils/buildingUtils';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  budgetVariance: number;
  outstandingInvoices: number;
  overduePayments: number;
  mriDataPercentage: number;
  lastMRISync?: string;
}

interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  isMRIData: boolean;
  lastSynced?: string;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  status: string;
  isMRIData: boolean;
  lastSynced?: string;
}

interface MRIFinancialDashboardProps {
  buildingId: string;
  className?: string;
}

const MRIFinancialDashboard: React.FC<MRIFinancialDashboardProps> = ({
  buildingId,
  className = ''
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netPosition: 0,
    budgetVariance: 0,
    outstandingInvoices: 0,
    overduePayments: 0,
    mriDataPercentage: 0
  });
  const [budgetComparisons, setBudgetComparisons] = useState<BudgetComparison[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadFinancialData();
  }, [buildingId, selectedPeriod]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadFinancialSummary(),
        loadBudgetComparisons(),
        loadRecentTransactions()
      ]);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      // Load combined data from both local transactions and MRI transactions
      const [localTransactions, mriTransactions, mriInvoices] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('building_id', buildingId),
        supabase
          .from('mri_transactions')
          .select('*')
          .eq('building_id', buildingId),
        supabase
          .from('mri_invoices')
          .select('*')
          .eq('building_id', buildingId)
      ]);

      const localData = localTransactions.data || [];
      const mriData = mriTransactions.data || [];
      const invoiceData = mriInvoices.data || [];

      // Calculate totals
      const totalLocalIncome = localData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalMRIIncome = mriData
        .filter(t => t.transaction_type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalLocalExpenses = localData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalMRIExpenses = mriData
        .filter(t => t.transaction_type === 'charge')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = totalLocalIncome + totalMRIIncome;
      const totalExpenses = totalLocalExpenses + totalMRIExpenses;
      const totalTransactions = localData.length + mriData.length;
      const mriDataPercentage = totalTransactions > 0 ? (mriData.length / totalTransactions) * 100 : 0;

      // Calculate outstanding invoices
      const outstandingInvoices = invoiceData
        .filter(inv => inv.status === 'pending' || inv.status === 'approved')
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Calculate overdue payments
      const overduePayments = invoiceData
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Get last MRI sync time
      const { data: syncStatus } = await supabase
        .from('mri_sync_status')
        .select('last_sync_date')
        .eq('building_id', buildingId)
        .eq('entity_type', 'transactions')
        .single();

      setSummary({
        totalIncome,
        totalExpenses,
        netPosition: totalIncome - totalExpenses,
        budgetVariance: 0, // Calculate from budget comparison
        outstandingInvoices,
        overduePayments,
        mriDataPercentage,
        lastMRISync: syncStatus?.last_sync_date
      });

    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  const loadBudgetComparisons = async () => {
    try {
      // Load budget data from both local and MRI sources
      const [localBudgets, mriBudgets] = await Promise.all([
        supabase
          .from('budget_items')
          .select('*')
          .eq('building_id', buildingId),
        supabase
          .from('mri_budgets')
          .select('*')
          .eq('building_id', buildingId)
          .eq('year', new Date().getFullYear())
      ]);

      const localData = localBudgets.data || [];
      const mriData = mriBudgets.data || [];

      // Combine and process budget data
      const categoryMap = new Map<string, BudgetComparison>();

      // Process local budget data
      localData.forEach(budget => {
        const existing = categoryMap.get(budget.category) || {
          category: budget.category,
          budgeted: 0,
          actual: 0,
          variance: 0,
          variancePercentage: 0,
          isMRIData: false
        };
        
        existing.budgeted += budget.annual_estimate || 0;
        existing.actual += budget.actual_spent || 0;
        categoryMap.set(budget.category, existing);
      });

      // Process MRI budget data
      mriData.forEach(budget => {
        const existing = categoryMap.get(budget.category) || {
          category: budget.category,
          budgeted: 0,
          actual: 0,
          variance: 0,
          variancePercentage: 0,
          isMRIData: true,
          lastSynced: budget.synced_at
        };
        
        existing.budgeted += budget.budget_amount || 0;
        existing.actual += budget.actual_amount || 0;
        existing.isMRIData = true;
        existing.lastSynced = budget.synced_at;
        categoryMap.set(budget.category, existing);
      });

      // Calculate variances
      const comparisons = Array.from(categoryMap.values()).map(comp => ({
        ...comp,
        variance: comp.actual - comp.budgeted,
        variancePercentage: comp.budgeted > 0 ? ((comp.actual - comp.budgeted) / comp.budgeted) * 100 : 0
      }));

      setBudgetComparisons(comparisons);

    } catch (error) {
      console.error('Error loading budget comparisons:', error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      // Load recent transactions from both sources
      const [localTransactions, mriTransactions] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('building_id', buildingId)
          .order('transaction_date', { ascending: false })
          .limit(10),
        supabase
          .from('mri_transactions')
          .select('*')
          .eq('building_id', buildingId)
          .order('transaction_date', { ascending: false })
          .limit(10)
      ]);

      const localData = (localTransactions.data || []).map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        date: t.transaction_date,
        category: t.category,
        status: t.status,
        isMRIData: false
      }));

      const mriData = (mriTransactions.data || []).map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.transaction_type === 'payment' ? 'income' as const : 'expense' as const,
        date: t.transaction_date,
        category: t.category,
        status: t.status,
        isMRIData: true,
        lastSynced: t.synced_at
      }));

      // Combine and sort by date
      const combined = [...localData, ...mriData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setRecentTransactions(combined);

    } catch (error) {
      console.error('Error loading recent transactions:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading financial data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with MRI Integration Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Combined view of local and MRI Qube financial data
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <Database className="h-4 w-4 inline mr-1" />
            {summary.mriDataPercentage.toFixed(0)}% MRI data
          </div>
          
          <div className="flex gap-2">
            {['month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  selectedPeriod === period
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={loadFinancialData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success-600" />
          </div>
          {summary.lastMRISync && (
            <MRIDataSourceIndicator
              isMRIData={true}
              lastSynced={summary.lastMRISync}
              size="sm"
              className="mt-2"
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-error-600">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-error-600" />
          </div>
          {summary.lastMRISync && (
            <MRIDataSourceIndicator
              isMRIData={true}
              lastSynced={summary.lastMRISync}
              size="sm"
              className="mt-2"
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Position</p>
              <p className={`text-2xl font-bold ${
                summary.netPosition >= 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {formatCurrency(summary.netPosition)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${
              summary.netPosition >= 0 ? 'text-success-600' : 'text-error-600'
            }`} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.outstandingInvoices)}
              </p>
            </div>
            <FileText className="h-8 w-8 text-amber-600" />
          </div>
          {summary.lastMRISync && (
            <MRIDataSourceIndicator
              isMRIData={true}
              lastSynced={summary.lastMRISync}
              size="sm"
              className="mt-2"
            />
          )}
        </Card>
      </div>

      {/* Budget vs Actual Comparison */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual</h3>
          <Badge variant="primary" size="sm">
            {budgetComparisons.filter(b => b.isMRIData).length} MRI categories
          </Badge>
        </div>
        
        <div className="space-y-4">
          {budgetComparisons.map((comparison) => (
            <div key={comparison.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{comparison.category}</h4>
                  <MRIDataSourceIndicator
                    isMRIData={comparison.isMRIData}
                    lastSynced={comparison.lastSynced}
                    size="sm"
                  />
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    comparison.variance >= 0 ? 'text-error-600' : 'text-success-600'
                  }`}>
                    {formatPercentage(comparison.variancePercentage)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Budgeted:</span>
                  <p className="font-medium">{formatCurrency(comparison.budgeted)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Actual:</span>
                  <p className="font-medium">{formatCurrency(comparison.actual)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Variance:</span>
                  <p className={`font-medium ${
                    comparison.variance >= 0 ? 'text-error-600' : 'text-success-600'
                  }`}>
                    {formatCurrency(Math.abs(comparison.variance))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Badge variant="primary" size="sm">
            {recentTransactions.filter(t => t.isMRIData).length} from MRI
          </Badge>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-success-50' : 'bg-error-50'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-success-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-error-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                    <MRIDataSourceIndicator
                      isMRIData={transaction.isMRIData}
                      lastSynced={transaction.lastSynced}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MRIFinancialDashboard;
