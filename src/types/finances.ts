export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  quarterlyEstimate: number;
  annualEstimate: number;
  actualSpent?: number;
  variance?: number;
  type: 'income' | 'expense';
  notes?: string;
  lastUpdated?: string;
}

export interface BudgetPeriod {
  id: string;
  year: number;
  quarter?: number;
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  status: 'draft' | 'approved' | 'active';
  createdBy: string;
  createdAt: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  reference?: string;
  supplier?: string;
  buildingId: string;
  createdBy: string;
  createdAt: string;
}

export interface ServiceCharge {
  id: string;
  unitId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  period: string;
  description: string;
}

export interface FinancialReport {
  id: string;
  type: 'budget' | 'cashflow' | 'variance' | 'annual';
  title: string;
  period: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
}
