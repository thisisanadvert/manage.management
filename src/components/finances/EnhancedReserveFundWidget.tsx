import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  History,
  Target,
  Building2,
  Calendar,
  Wrench
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ReserveFundData {
  currentBalance: number;
  recommendedLevel: number;
  targetLevel: number;
  monthsCoverage: number;
  usageHistory: {
    month: string;
    amount: number;
    purpose: string;
  }[];
  futureRequirements: {
    year: number;
    description: string;
    estimatedCost: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  buildingMetadata: {
    age: number;
    units: number;
    type: string;
    lastMajorWorks: Date;
  };
}

interface EnhancedReserveFundWidgetProps {
  className?: string;
  onNavigateToCalculator?: () => void;
  onNavigateToPlanning?: () => void;
}

const EnhancedReserveFundWidget: React.FC<EnhancedReserveFundWidgetProps> = ({
  className = '',
  onNavigateToCalculator,
  onNavigateToPlanning
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<ReserveFundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const fetchReserveFundData = async () => {
    if (!user?.metadata?.buildingId) return;

    try {
      // Fetch financial setup and building data
      const [financialResponse, buildingResponse] = await Promise.all([
        supabase
          .from('financial_setup')
          .select('*')
          .eq('building_id', user.metadata.buildingId)
          .single(),
        supabase
          .from('buildings')
          .select('*')
          .eq('id', user.metadata.buildingId)
          .single()
      ]);

      if (financialResponse.error) throw financialResponse.error;
      if (buildingResponse.error) throw buildingResponse.error;

      const building = buildingResponse.data;
      const financial = financialResponse.data;

      // Calculate recommended reserve fund based on building metadata
      const buildingAge = building.building_age || 10;
      const totalUnits = building.total_units || 20;
      const buildingType = building.building_type || 'apartment';
      
      // Reserve fund calculation algorithm
      const baseReserve = totalUnits * 1000; // £1000 per unit base
      const ageMultiplier = Math.min(buildingAge / 50, 1.5); // Increase with age
      const typeMultiplier = buildingType === 'house' ? 0.8 : 1.2; // Apartments need more
      const recommendedLevel = baseReserve * ageMultiplier * typeMultiplier;

      const enhancedData: ReserveFundData = {
        currentBalance: financial?.reserve_fund_balance || 50000,
        recommendedLevel: Math.round(recommendedLevel),
        targetLevel: financial?.reserve_fund_target || 60000,
        monthsCoverage: 8.5,
        usageHistory: [
          { month: 'Mar 2025', amount: -5000, purpose: 'Roof repairs' },
          { month: 'Jan 2025', amount: -2500, purpose: 'Lift maintenance' },
          { month: 'Dec 2024', amount: -1200, purpose: 'Emergency plumbing' }
        ],
        futureRequirements: [
          { year: 2026, description: 'External decoration', estimatedCost: 15000, priority: 'high' },
          { year: 2027, description: 'Lift modernisation', estimatedCost: 25000, priority: 'medium' },
          { year: 2028, description: 'Roof replacement', estimatedCost: 40000, priority: 'high' }
        ],
        buildingMetadata: {
          age: buildingAge,
          units: totalUnits,
          type: buildingType,
          lastMajorWorks: new Date('2022-06-15')
        }
      };

      setData(enhancedData);
    } catch (error) {
      console.error('Error fetching reserve fund data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReserveFundData();
  }, [user?.metadata?.buildingId]);

  const getReserveFundStatus = (current: number, recommended: number) => {
    const ratio = current / recommended;
    if (ratio >= 1) return { color: 'success', label: 'Excellent', icon: CheckCircle2 };
    if (ratio >= 0.8) return { color: 'warning', label: 'Good', icon: TrendingUp };
    return { color: 'danger', label: 'Low', icon: AlertTriangle };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Unable to load reserve fund data</p>
          <Button variant="outline" size="sm" onClick={fetchReserveFundData} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const status = getReserveFundStatus(data.currentBalance, data.recommendedLevel);
  const StatusIcon = status.icon;
  const fundingRatio = data.currentBalance / data.recommendedLevel;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <PiggyBank className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reserve Fund</h3>
            <p className="text-xs text-gray-500">
              {data.monthsCoverage} months coverage
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={status.color} size="sm">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Current Balance */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.currentBalance)}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">of</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.recommendedLevel)}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Current Level</span>
            <span>Recommended Level</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                status.color === 'success' ? 'bg-green-500' :
                status.color === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(fundingRatio * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(fundingRatio * 100).toFixed(1)}% of recommended level
          </div>
        </div>
      </div>

      {/* Building Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Building Info</span>
          </div>
          <div className="text-sm">
            <div>{data.buildingMetadata.age} years old</div>
            <div>{data.buildingMetadata.units} units</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Last Major Works</span>
          </div>
          <div className="text-sm">
            {data.buildingMetadata.lastMajorWorks.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Recent Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Recent Usage</span>
          <History className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {data.usageHistory.slice(0, 2).map((usage, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div>
                <div className="font-medium text-gray-900">{usage.purpose}</div>
                <div className="text-xs text-gray-500">{usage.month}</div>
              </div>
              <div className="text-red-600 font-medium">
                {formatCurrency(Math.abs(usage.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Requirements */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Upcoming Requirements</span>
          <Target className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {data.futureRequirements.slice(0, 2).map((requirement, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {requirement.description}
                  </span>
                  <Badge variant={getPriorityColor(requirement.priority)} size="sm">
                    {requirement.priority}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">{requirement.year}</div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(requirement.estimatedCost)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setShowCalculator(true)}
        >
          <Calculator className="h-4 w-4 mr-1" />
          Calculator
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onNavigateToPlanning}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Planning
        </Button>
      </div>

      {/* Reserve Fund Calculator Modal would go here */}
      {showCalculator && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reserve Fund Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Age (years)
                </label>
                <input 
                  type="number" 
                  value={data.buildingMetadata.age}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Units
                </label>
                <input 
                  type="number" 
                  value={data.buildingMetadata.units}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  Recommended Reserve Fund
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {formatCurrency(data.recommendedLevel)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Based on building age, size, and type
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCalculator(false)}
              >
                Close
              </Button>
              <Button variant="primary" className="flex-1">
                Update Target
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedReserveFundWidget;
