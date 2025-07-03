import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ServiceChargeData {
  currentBalance: number;
  collectionRate: number;
  totalArrears: number;
  arrearsCount: number;
  nextDemandDate: Date;
  quarterlyTarget: number;
  cashflowProjection: {
    month1: number;
    month2: number;
    month3: number;
  };
  majorWorksAllocation: number;
  section20Required: boolean;
}

interface EnhancedServiceChargeWidgetProps {
  className?: string;
  onNavigateToFinances?: () => void;
  onNavigateToSection20?: () => void;
}

const EnhancedServiceChargeWidget: React.FC<EnhancedServiceChargeWidgetProps> = ({
  className = '',
  onNavigateToFinances,
  onNavigateToSection20
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<ServiceChargeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const fetchServiceChargeData = async () => {
    if (!user?.metadata?.buildingId) return;

    try {
      // Fetch financial setup data
      const { data: financialData, error } = await supabase
        .from('financial_setup')
        .select('*')
        .eq('building_id', user.metadata.buildingId)
        .single();

      if (error) throw error;

      // Mock enhanced data - in production, this would come from multiple tables
      const enhancedData: ServiceChargeData = {
        currentBalance: financialData?.service_charge_account_balance || 150000,
        collectionRate: 94.5, // Calculate from payments vs demands
        totalArrears: 8750,
        arrearsCount: 3,
        nextDemandDate: new Date('2025-07-01'),
        quarterlyTarget: 45000,
        cashflowProjection: {
          month1: 42000,
          month2: 38500,
          month3: 41200
        },
        majorWorksAllocation: 25000,
        section20Required: true
      };

      setData(enhancedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching service charge data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceChargeData();
  }, [user?.metadata?.buildingId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchServiceChargeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getCollectionRateStatus = (rate: number) => {
    if (rate >= 95) return { color: 'success', label: 'Excellent' };
    if (rate >= 90) return { color: 'warning', label: 'Good' };
    return { color: 'danger', label: 'Needs Attention' };
  };

  const getArrearsStatus = (count: number) => {
    if (count === 0) return { color: 'success', icon: CheckCircle2 };
    if (count <= 2) return { color: 'warning', icon: Clock };
    return { color: 'danger', icon: AlertTriangle };
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
          <p className="text-gray-600">Unable to load service charge data</p>
          <Button variant="outline" size="sm" onClick={fetchServiceChargeData} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const collectionStatus = getCollectionRateStatus(data.collectionRate);
  const arrearsStatus = getArrearsStatus(data.arrearsCount);
  const ArrearsIcon = arrearsStatus.icon;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Wallet className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Charge Account</h3>
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          {onNavigateToFinances && (
            <Button variant="ghost" size="sm" onClick={onNavigateToFinances}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Current Balance */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.currentBalance)}
          </span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span className="text-sm text-success-600">+12.5%</span>
            <span className="text-xs text-gray-500">vs last quarter</span>
          </div>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Collection Rate</span>
            <Badge variant={collectionStatus.color} size="sm">
              {collectionStatus.label}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  collectionStatus.color === 'success' ? 'bg-green-500' :
                  collectionStatus.color === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.collectionRate}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold">{data.collectionRate}%</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Arrears</span>
            <ArrearsIcon className={`h-4 w-4 ${
              arrearsStatus.color === 'success' ? 'text-green-500' :
              arrearsStatus.color === 'warning' ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(data.totalArrears)}
            </div>
            <div className="text-xs text-gray-500">
              {data.arrearsCount} unit{data.arrearsCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Month Cashflow Projection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">3-Month Cashflow Projection</span>
          <BarChart3 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(data.cashflowProjection).map(([month, amount], index) => (
            <div key={month} className="text-center p-2 bg-blue-50 rounded">
              <div className="text-xs text-gray-500 mb-1">
                Month {index + 1}
              </div>
              <div className="text-sm font-semibold text-blue-900">
                {formatCurrency(amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Major Works & Section 20 */}
      {data.section20Required && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-yellow-800">
                  Section 20 Consultation Required
                </div>
                <div className="text-xs text-yellow-700">
                  Major works allocation: {formatCurrency(data.majorWorksAllocation)}
                </div>
              </div>
            </div>
            {onNavigateToSection20 && (
              <Button variant="outline" size="sm" onClick={onNavigateToSection20}>
                Start Consultation
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1">
          <Users className="h-4 w-4 mr-1" />
          Chase Arrears
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Calendar className="h-4 w-4 mr-1" />
          Next Demand
        </Button>
      </div>
    </Card>
  );
};

export default EnhancedServiceChargeWidget;
