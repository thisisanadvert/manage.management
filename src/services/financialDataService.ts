/**
 * Financial Data Service
 * Handles all financial data operations and database interactions
 */

import { supabase } from '../lib/supabase';

export interface Transaction {
  id?: string;
  building_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  transaction_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method?: string;
  reference_number?: string;
  bank_account?: string;
  receipt_url?: string;
  notes?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  ai_category?: string;
  ai_confidence?: number;
  recurring_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceChargePayment {
  id?: string;
  building_id: string;
  unit_id?: string;
  demand_id?: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  status: 'pending' | 'received' | 'overdue' | 'partial';
  late_fee?: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MajorWorksProject {
  id?: string;
  building_id: string;
  project_name: string;
  description?: string;
  estimated_cost?: number;
  actual_cost?: number;
  start_date?: string;
  completion_date?: string;
  status: 'planning' | 'consultation' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  section20_required?: boolean;
  section20_consultation_id?: string;
  contractor_name?: string;
  contractor_contact?: string;
  warranty_period?: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReserveFundTransaction {
  id?: string;
  building_id: string;
  description: string;
  amount: number;
  type: 'contribution' | 'withdrawal' | 'interest' | 'transfer';
  transaction_date: string;
  balance_after?: number;
  purpose?: string;
  approved_by?: string;
  notes?: string;
  created_by: string;
  created_at?: string;
}

export interface BankAccount {
  id?: string;
  building_id: string;
  account_name: string;
  account_number?: string;
  sort_code?: string;
  bank_name?: string;
  account_type?: 'current' | 'savings' | 'reserve';
  current_balance?: number;
  is_primary?: boolean;
  is_active?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringTransaction {
  id?: string;
  building_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date?: string;
  next_due_date: string;
  is_active?: boolean;
  auto_approve?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

class FinancialDataService {
  // =====================================================
  // TRANSACTIONS
  // =====================================================

  async createTransaction(transaction: Transaction): Promise<{ data: Transaction | null; error: any }> {
    try {
      console.log('financialDataService.createTransaction called with:', transaction);

      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      console.log('Supabase response - data:', data, 'error:', error);

      if (error) {
        console.error('Supabase error details:', error);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception in createTransaction:', error);
      return { data: null, error };
    }
  }

  async getTransactions(buildingId: string, filters?: {
    type?: 'income' | 'expense';
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<{ data: Transaction[] | null; error: any }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('building_id', buildingId)
        .order('transaction_date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('transaction_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('transaction_date', filters.dateTo);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { data: null, error };
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { data: null, error };
    }
  }

  async deleteTransaction(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { error };
    }
  }

  // =====================================================
  // SERVICE CHARGE PAYMENTS
  // =====================================================

  async createServiceChargePayment(payment: ServiceChargePayment): Promise<{ data: ServiceChargePayment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('service_charge_payments')
        .insert([payment])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating service charge payment:', error);
      return { data: null, error };
    }
  }

  async getServiceChargePayments(buildingId: string, filters?: {
    unitId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: ServiceChargePayment[] | null; error: any }> {
    try {
      let query = supabase
        .from('service_charge_payments')
        .select('*')
        .eq('building_id', buildingId)
        .order('payment_date', { ascending: false });

      if (filters?.unitId) {
        query = query.eq('unit_id', filters.unitId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('payment_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('payment_date', filters.dateTo);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching service charge payments:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // MAJOR WORKS PROJECTS
  // =====================================================

  async createMajorWorksProject(project: MajorWorksProject): Promise<{ data: MajorWorksProject | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('major_works_projects')
        .insert([project])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating major works project:', error);
      return { data: null, error };
    }
  }

  async getMajorWorksProjects(buildingId: string): Promise<{ data: MajorWorksProject[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('major_works_projects')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching major works projects:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // RESERVE FUND
  // =====================================================

  async createReserveFundTransaction(transaction: ReserveFundTransaction): Promise<{ data: ReserveFundTransaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reserve_fund_transactions')
        .insert([transaction])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating reserve fund transaction:', error);
      return { data: null, error };
    }
  }

  async getReserveFundTransactions(buildingId: string): Promise<{ data: ReserveFundTransaction[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reserve_fund_transactions')
        .select('*')
        .eq('building_id', buildingId)
        .order('transaction_date', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching reserve fund transactions:', error);
      return { data: null, error };
    }
  }

  async getReserveFundBalance(buildingId: string): Promise<{ balance: number; error: any }> {
    try {
      const { data, error } = await supabase
        .from('reserve_fund_transactions')
        .select('balance_after')
        .eq('building_id', buildingId)
        .order('transaction_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      const balance = data && data.length > 0 ? data[0].balance_after || 0 : 0;
      return { balance, error: null };
    } catch (error) {
      console.error('Error fetching reserve fund balance:', error);
      return { balance: 0, error };
    }
  }

  // =====================================================
  // BANK ACCOUNTS
  // =====================================================

  async createBankAccount(account: BankAccount): Promise<{ data: BankAccount | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([account])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating bank account:', error);
      return { data: null, error };
    }
  }

  async getBankAccounts(buildingId: string): Promise<{ data: BankAccount[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('building_id', buildingId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // FINANCIAL SUMMARY & REPORTS
  // =====================================================

  async getFinancialSummary(buildingId: string, period?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netPosition: number;
    serviceChargeBalance: number;
    reserveFundBalance: number;
    error: any;
  }> {
    try {
      // Get current period if not specified
      const currentPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM format

      // Get transactions for the period
      const { data: transactions, error: transError } = await this.getTransactions(buildingId, {
        dateFrom: `${currentPeriod}-01`,
        dateTo: `${currentPeriod}-31`
      });

      if (transError) throw transError;

      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
      const netPosition = totalIncome - totalExpenses;

      // Get reserve fund balance
      const { balance: reserveFundBalance } = await this.getReserveFundBalance(buildingId);

      // Get service charge balance (from financial_setup or calculate)
      const { data: financialSetup } = await supabase
        .from('financial_setup')
        .select('service_charge_account_balance')
        .eq('building_id', buildingId)
        .single();

      const serviceChargeBalance = financialSetup?.service_charge_account_balance || 0;

      return {
        totalIncome,
        totalExpenses,
        netPosition,
        serviceChargeBalance,
        reserveFundBalance,
        error: null
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netPosition: 0,
        serviceChargeBalance: 0,
        reserveFundBalance: 0,
        error
      };
    }
  }
}

export const financialDataService = new FinancialDataService();
