import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingDown,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Settings,
  Percent,
  Clock,
  Target
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserBuildingId } from '../../utils/buildingUtils';

interface ServiceChargeCollection {
  id: string;
  amount: number;
  collectionDate: string;
  frequency: 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
  status: 'pending' | 'collected' | 'overdue';
  managementFee: number;
  feePercentage: number;
  residents: number;
  amountPerResident: number;
  notes: string;
}

interface FeeStructure {
  frequency: 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
  percentage: number;
  description: string;
  recommendedFor: string;
  savings: string;
}

const ServiceCharges: React.FC = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<ServiceChargeCollection[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('quarterly');
  const [estimatorAmount, setEstimatorAmount] = useState(50000);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeeEstimator, setShowFeeEstimator] = useState(false);

  const feeStructure: FeeStructure[] = [
    {
      frequency: 'monthly',
      percentage: 3.0,
      description: 'Highest flexibility, monthly collections',
      recommendedFor: 'Buildings with cash flow concerns',
      savings: 'Base rate'
    },
    {
      frequency: 'quarterly',
      percentage: 2.5,
      description: 'Balanced approach, seasonal collections',
      recommendedFor: 'Most buildings - optimal balance',
      savings: '0.5% savings vs monthly'
    },
    {
      frequency: 'bi-annual',
      percentage: 2.0,
      description: 'Twice yearly collections',
      recommendedFor: 'Well-managed buildings',
      savings: '1.0% savings vs monthly'
    },
    {
      frequency: 'annual',
      percentage: 1.5,
      description: 'Lowest fees, annual collections',
      recommendedFor: 'Buildings with strong reserves',
      savings: '1.5% savings vs monthly'
    }
  ];

  useEffect(() => {
    loadServiceChargeData();
  }, []);

  const loadServiceChargeData = async () => {
    try {
      setIsLoading(true);
      const buildingId = await getUserBuildingId(user?.id);
      
      if (!buildingId) return;

      const { data, error } = await supabase
        .from('service_charge_collections')
        .select('*')
        .eq('building_id', buildingId)
        .order('collection_date', { ascending: false });

      if (error) throw error;

      setCollections(data || [
        {
          id: '1',
          amount: 37500,
          collectionDate: '2025-01-01',
          frequency: 'quarterly',
          status: 'collected',
          managementFee: 937.50,
          feePercentage: 2.5,
          residents: 15,
          amountPerResident: 2500,
          notes: 'Q1 2025 Service Charges'
        },
        {
          id: '2',
          amount: 37500,
          collectionDate: '2024-10-01',
          frequency: 'quarterly',
          status: 'collected',
          managementFee: 937.50,
          feePercentage: 2.5,
          residents: 15,
          amountPerResident: 2500,
          notes: 'Q4 2024 Service Charges'
        },
        {
          id: '3',
          amount: 37500,
          collectionDate: '2024-07-01',
          frequency: 'quarterly',
          status: 'collected',
          managementFee: 937.50,
          feePercentage: 2.5,
          residents: 15,
          amountPerResident: 2500,
          notes: 'Q3 2024 Service Charges'
        }
      ]);
    } catch (error) {
      console.error('Error loading service charge data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFeeComparison = (amount: number) => {
    return feeStructure.map(structure => ({
      ...structure,
      annualFee: (amount * structure.percentage) / 100,
      monthlySavings: structure.frequency !== 'monthly' 
        ? ((amount * 3.0) / 100) - ((amount * structure.percentage) / 100)
        : 0
    }));
  };

  const getTotalCollected = () => {
    return collections
      .filter(c => c.status === 'collected')
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const getTotalFees = () => {
    return collections
      .filter(c => c.status === 'collected')
      .reduce((sum, c) => sum + c.managementFee, 0);
  };

  const getAverageFeePercentage = () => {
    const collectedItems = collections.filter(c => c.status === 'collected');
    if (collectedItems.length === 0) return 0;
    
    return collectedItems.reduce((sum, c) => sum + c.feePercentage, 0) / collectedItems.length;
  };

  const feeComparison = calculateFeeComparison(estimatorAmount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Charges & Fee Structure</h2>
          <p className="text-gray-600 mt-1">
            Transparent pricing with incentives for less frequent collections
          </p>
        </div>
        <button
          onClick={() => setShowFeeEstimator(!showFeeEstimator)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Calculator className="h-4 w-4" />
          <span>Fee Estimator</span>
        </button>
      </div>

      {/* Transparent Fee Structure */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Percent className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Manage.Management Fee Structure</h3>
          <Badge variant="info">Transparent Pricing</Badge>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Lower Frequency = Lower Fees</h4>
              <p className="text-sm text-blue-800 mt-1">
                Our pricing rewards efficient collection schedules. Choose less frequent collections 
                to reduce management fees while maintaining excellent service.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {feeStructure.map((structure) => (
            <div
              key={structure.frequency}
              className={`border-2 rounded-lg p-4 transition-all ${
                structure.frequency === 'quarterly' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium capitalize">{structure.frequency}</span>
                  {structure.frequency === 'quarterly' && (
                    <Badge variant="info" size="sm">Recommended</Badge>
                  )}
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {structure.percentage}%
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {structure.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    <strong>Best for:</strong> {structure.recommendedFor}
                  </div>
                  
                  {structure.frequency !== 'monthly' && (
                    <div className="text-xs text-green-600 font-medium">
                      💰 {structure.savings}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fee Estimator */}
      {showFeeEstimator && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Fee Estimator</h3>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Service Charge Amount (£)
            </label>
            <input
              type="number"
              value={estimatorAmount}
              onChange={(e) => setEstimatorAmount(parseInt(e.target.value) || 0)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annual Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annual Savings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeComparison.map((comparison) => (
                  <tr key={comparison.frequency} className={comparison.frequency === 'quarterly' ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{comparison.frequency}</span>
                        {comparison.frequency === 'quarterly' && (
                          <Badge variant="info" size="sm">Recommended</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comparison.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      £{comparison.annualFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {comparison.monthlySavings > 0 ? (
                        <span className="text-green-600 font-medium">
                          £{comparison.monthlySavings.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">Base rate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Collection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">£{getTotalCollected().toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Management Fees</p>
              <p className="text-2xl font-bold text-blue-600">£{getTotalFees().toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                Avg: {getAverageFeePercentage().toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net to Building</p>
              <p className="text-2xl font-bold text-purple-600">
                £{(getTotalCollected() - getTotalFees()).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Collections History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Collection History</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading collection data...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No service charge collections recorded yet</p>
            <p className="text-sm text-gray-500">Collections will appear here once recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Management Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection) => (
                  <tr key={collection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(collection.collectionDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      £{collection.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">
                        {collection.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.feePercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      £{collection.managementFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          collection.status === 'collected' ? 'success' :
                          collection.status === 'pending' ? 'warning' : 'error'
                        }
                      >
                        {collection.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingDown className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Fee Optimization Recommendations</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Switch to Quarterly Collections</h4>
                <p className="text-sm text-green-800 mt-1">
                  Based on your current collection pattern, switching to quarterly collections
                  could save you approximately £{((estimatorAmount * 3.0) / 100 - (estimatorAmount * 2.5) / 100).toLocaleString()}
                  annually while maintaining excellent cash flow.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Annual Collections for Maximum Savings</h4>
                <p className="text-sm text-blue-800 mt-1">
                  If your building has strong reserves, annual collections offer the lowest fees at just 1.5%.
                  This could save you £{((estimatorAmount * 3.0) / 100 - (estimatorAmount * 1.5) / 100).toLocaleString()}
                  compared to monthly collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceCharges;
