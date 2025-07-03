import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

interface CashflowData {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
  balance: number;
  transactions: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
  }[];
}

interface InteractiveCashflowChartProps {
  className?: string;
  period?: '6months' | '12months' | '24months';
  onDrillDown?: (month: string, transactions: any[]) => void;
}

const InteractiveCashflowChart: React.FC<InteractiveCashflowChartProps> = ({
  className = '',
  period = '12months',
  onDrillDown
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<CashflowData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const generateMockData = (): CashflowData[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      
      // Generate realistic financial data
      const baseIncome = 45000 + (Math.random() - 0.5) * 5000;
      const baseExpenses = 35000 + (Math.random() - 0.5) * 8000;
      const netFlow = baseIncome - baseExpenses;
      const previousBalance = i === 11 ? 150000 : months[months.length - 1]?.balance || 150000;
      
      months.push({
        month: monthName,
        income: Math.round(baseIncome),
        expenses: Math.round(baseExpenses),
        netFlow: Math.round(netFlow),
        balance: Math.round(previousBalance + netFlow),
        transactions: [
          {
            id: `${i}-1`,
            description: 'Service Charge Collection',
            amount: Math.round(baseIncome * 0.8),
            type: 'income' as const,
            category: 'Service Charges',
            date: date.toISOString()
          },
          {
            id: `${i}-2`,
            description: 'Ground Rent Collection',
            amount: Math.round(baseIncome * 0.2),
            type: 'income' as const,
            category: 'Ground Rent',
            date: date.toISOString()
          },
          {
            id: `${i}-3`,
            description: 'Building Maintenance',
            amount: Math.round(baseExpenses * 0.4),
            type: 'expense' as const,
            category: 'Maintenance',
            date: date.toISOString()
          },
          {
            id: `${i}-4`,
            description: 'Insurance Premium',
            amount: Math.round(baseExpenses * 0.3),
            type: 'expense' as const,
            category: 'Insurance',
            date: date.toISOString()
          },
          {
            id: `${i}-5`,
            description: 'Utilities & Services',
            amount: Math.round(baseExpenses * 0.3),
            type: 'expense' as const,
            category: 'Utilities',
            date: date.toISOString()
          }
        ]
      });
    }
    
    return months;
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 1000);
  }, [period]);

  const handleBarClick = (monthData: CashflowData) => {
    setSelectedMonth(monthData.month);
    if (onDrillDown) {
      onDrillDown(monthData.month, monthData.transactions);
    }
  };

  const getMaxValue = () => {
    const allValues = data.flatMap(d => [Math.abs(d.income), Math.abs(d.expenses), Math.abs(d.netFlow)]);
    return Math.max(...allValues);
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return Math.abs(value) / maxValue * 100;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const maxValue = getMaxValue();
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cashflow Analysis</h3>
          <p className="text-sm text-gray-600">12-month income vs expenses</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700">Total Income</div>
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(latestData?.income || 0)}
              </div>
            </div>
            {previousData && getTrendIcon(latestData?.income || 0, previousData.income)}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-700">Total Expenses</div>
              <div className="text-lg font-bold text-red-900">
                {formatCurrency(latestData?.expenses || 0)}
              </div>
            </div>
            {previousData && getTrendIcon(latestData?.expenses || 0, previousData.expenses)}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-700">Net Flow</div>
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(latestData?.netFlow || 0)}
              </div>
            </div>
            {previousData && getTrendIcon(latestData?.netFlow || 0, previousData.netFlow)}
          </div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        /* Chart View */
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Expenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Net Flow</span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-full space-x-1">
              {data.map((monthData, index) => (
                <div 
                  key={monthData.month}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                  onClick={() => handleBarClick(monthData)}
                >
                  {/* Bars */}
                  <div className="relative flex items-end space-x-1 h-48 mb-2">
                    {/* Income Bar */}
                    <div 
                      className="w-4 bg-green-500 rounded-t group-hover:bg-green-600 transition-colors"
                      style={{ height: `${getBarHeight(monthData.income, maxValue)}%` }}
                      title={`Income: ${formatCurrency(monthData.income)}`}
                    ></div>
                    
                    {/* Expenses Bar */}
                    <div 
                      className="w-4 bg-red-500 rounded-t group-hover:bg-red-600 transition-colors"
                      style={{ height: `${getBarHeight(monthData.expenses, maxValue)}%` }}
                      title={`Expenses: ${formatCurrency(monthData.expenses)}`}
                    ></div>
                    
                    {/* Net Flow Bar */}
                    <div 
                      className={`w-4 rounded-t group-hover:opacity-80 transition-colors ${
                        monthData.netFlow >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ height: `${getBarHeight(monthData.netFlow, maxValue)}%` }}
                      title={`Net Flow: ${formatCurrency(monthData.netFlow)}`}
                    ></div>
                  </div>
                  
                  {/* Month Label */}
                  <div className={`text-xs text-center ${
                    selectedMonth === monthData.month ? 'font-bold text-blue-600' : 'text-gray-600'
                  }`}>
                    {monthData.month.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Month Details */}
          {selectedMonth && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{selectedMonth} Details</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMonth(null)}
                >
                  ×
                </Button>
              </div>
              {(() => {
                const monthData = data.find(d => d.month === selectedMonth);
                if (!monthData) return null;
                
                return (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-800">Income Breakdown</div>
                      {monthData.transactions
                        .filter(t => t.type === 'income')
                        .map(t => (
                          <div key={t.id} className="flex justify-between">
                            <span>{t.description}</span>
                            <span className="font-medium">{formatCurrency(t.amount)}</span>
                          </div>
                        ))}
                    </div>
                    <div>
                      <div className="font-medium text-blue-800">Expense Breakdown</div>
                      {monthData.transactions
                        .filter(t => t.type === 'expense')
                        .map(t => (
                          <div key={t.id} className="flex justify-between">
                            <span>{t.description}</span>
                            <span className="font-medium">{formatCurrency(t.amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Income</th>
                <th className="text-right py-2">Expenses</th>
                <th className="text-right py-2">Net Flow</th>
                <th className="text-right py-2">Balance</th>
                <th className="text-center py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((monthData, index) => {
                const previousMonth = index > 0 ? data[index - 1] : null;
                return (
                  <tr 
                    key={monthData.month}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleBarClick(monthData)}
                  >
                    <td className="py-2 font-medium">{monthData.month}</td>
                    <td className="py-2 text-right text-green-600 font-medium">
                      {formatCurrency(monthData.income)}
                    </td>
                    <td className="py-2 text-right text-red-600 font-medium">
                      {formatCurrency(monthData.expenses)}
                    </td>
                    <td className={`py-2 text-right font-medium ${
                      monthData.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(monthData.netFlow)}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {formatCurrency(monthData.balance)}
                    </td>
                    <td className="py-2 text-center">
                      {previousMonth && getTrendIcon(monthData.netFlow, previousMonth.netFlow)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default InteractiveCashflowChart;
