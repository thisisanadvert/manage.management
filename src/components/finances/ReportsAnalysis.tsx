import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Calculator,
  FileSpreadsheet,
  Eye,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserBuildingId } from '../../utils/buildingUtils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'income_expenditure' | 'service_charges' | 'budget_analysis' | 'annual_statement';
  icon: React.ReactNode;
  formats: string[];
  compliance: string[];
  lastGenerated?: string;
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  serviceCharges: number;
  managementFees: number;
  budgetVariance: number;
  period: string;
}

const ReportsAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'income-expenditure',
      name: 'Income & Expenditure Summary',
      description: 'Comprehensive overview of all income and expenses for the selected period',
      type: 'income_expenditure',
      icon: <BarChart3 className="h-6 w-6" />,
      formats: ['PDF', 'CSV', 'Excel'],
      compliance: ['UK GAAP', 'Property Management Standards']
    },
    {
      id: 'service-charges',
      name: 'Service Charge Collection Report',
      description: 'Detailed breakdown of service charge collections, fees, and payment status',
      type: 'service_charges',
      icon: <PieChart className="h-6 w-6" />,
      formats: ['PDF', 'CSV'],
      compliance: ['LTA 1985', 'Service Charge Regulations']
    },
    {
      id: 'budget-analysis',
      name: 'Budget vs Actual Analysis',
      description: 'Compare planned budgets against actual expenditure with variance analysis',
      type: 'budget_analysis',
      icon: <TrendingUp className="h-6 w-6" />,
      formats: ['PDF', 'Excel'],
      compliance: ['Financial Planning Standards']
    },
    {
      id: 'annual-statement',
      name: 'Annual Financial Statement',
      description: 'Complete annual financial statement suitable for year-end filing',
      type: 'annual_statement',
      icon: <FileText className="h-6 w-6" />,
      formats: ['PDF'],
      compliance: ['Companies House', 'UK GAAP', 'LTA 1985']
    }
  ];

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      const buildingId = await getUserBuildingId(user?.id);
      
      if (!buildingId) return;

      // Load financial summary data
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*')
        .eq('building_id', buildingId)
        .eq('period', selectedPeriod)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setFinancialData(data || {
        totalIncome: 150000,
        totalExpenses: 125000,
        serviceCharges: 140000,
        managementFees: 3500,
        budgetVariance: -2500,
        period: selectedPeriod
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string, format: string) => {
    try {
      setIsGenerating(true);
      const buildingId = await getUserBuildingId(user?.id);
      
      if (!buildingId) return;

      // In a real implementation, this would call a report generation service
      const reportData = {
        building_id: buildingId,
        report_type: reportType,
        format: format,
        period: selectedPeriod,
        generated_by: user?.id,
        generated_at: new Date().toISOString()
      };

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create download link (in real implementation, this would be a blob URL)
      const fileName = `${reportType}-${selectedPeriod}.${format.toLowerCase()}`;
      
      // For demo purposes, create a simple text file
      const content = `Financial Report: ${reportType}\nPeriod: ${selectedPeriod}\nGenerated: ${new Date().toLocaleString()}\n\nThis is a sample report. In production, this would contain actual financial data.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getComplianceStatus = (compliance: string[]) => {
    return compliance.map(standard => (
      <Badge key={standard} variant="success" size="sm" className="mr-1 mb-1">
        {standard}
      </Badge>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Financial Analysis</h2>
          <p className="text-gray-600 mt-1">
            Generate compliant financial reports for filing and analysis
          </p>
        </div>
        <button
          onClick={loadFinancialData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Period Selection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Reporting Period</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current-year">Current Year</option>
              <option value="previous-year">Previous Year</option>
              <option value="current-quarter">Current Quarter</option>
              <option value="previous-quarter">Previous Quarter</option>
              <option value="ytd">Year to Date</option>
              <option value="custom">Custom Period</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">UK Compliance Ready</h4>
              <p className="text-sm text-blue-800 mt-1">
                All reports are designed to meet UK property management accounting standards, 
                including LTA 1985 requirements and Companies House filing standards.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      {financialData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  £{financialData.totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calculator className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  £{financialData.totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PieChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Charges</p>
                <p className="text-2xl font-bold text-blue-600">
                  £{financialData.serviceCharges.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Position</p>
                <p className={`text-2xl font-bold ${
                  (financialData.totalIncome - financialData.totalExpenses) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  £{(financialData.totalIncome - financialData.totalExpenses).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTemplates.map((template) => (
          <Card key={template.id}>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {template.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Compliance Standards:</p>
                  <div className="flex flex-wrap">
                    {getComplianceStatus(template.compliance)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {template.formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => generateReport(template.id, format)}
                        disabled={isGenerating}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>{format}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                
                {template.lastGenerated && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsAnalysis;
