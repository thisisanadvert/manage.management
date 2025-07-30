import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator,
  Info,
  Target
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import RTMTimelineService from '../../services/rtmTimelineService';

interface RTMDeadlineCalculatorProps {
  buildingId: string;
  onDateCalculated?: (milestone: string, date: string) => void;
}

interface DeadlineCalculation {
  milestone: string;
  title: string;
  description: string;
  baseDate?: string;
  baseDateLabel: string;
  calculatedDate?: string;
  daysFromBase: number;
  isStatutory: boolean;
  isUrgent: boolean;
  isOverdue: boolean;
  status: 'pending' | 'calculated' | 'completed';
}

const RTMDeadlineCalculator: React.FC<RTMDeadlineCalculatorProps> = ({
  buildingId,
  onDateCalculated
}) => {
  const [calculations, setCalculations] = useState<DeadlineCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');

  const timelineService = RTMTimelineService.getInstance();

  useEffect(() => {
    loadDeadlineCalculations();
  }, [buildingId]);

  const loadDeadlineCalculations = async () => {
    setLoading(true);
    try {
      const timelineData = await timelineService.getTimelineOverview(buildingId);
      if (!timelineData) return;

      const calcs: DeadlineCalculation[] = [
        {
          milestone: 'company_formation',
          title: 'Company Formation Deadline',
          description: 'RTM company must be formed before serving claim notice',
          baseDateLabel: 'Target claim notice date',
          daysFromBase: -14, // 2 weeks before claim notice
          isStatutory: false,
          isUrgent: false,
          isOverdue: false,
          status: 'pending'
        },
        {
          milestone: 'claim_notice_served',
          title: 'Claim Notice Service',
          description: 'Formal notice to landlord and qualifying tenants',
          baseDateLabel: 'Selected service date',
          daysFromBase: 0,
          isStatutory: true,
          isUrgent: false,
          isOverdue: false,
          status: 'pending'
        },
        {
          milestone: 'counter_notice_deadline',
          title: 'Counter-Notice Deadline',
          description: 'Landlord has 1 month to dispute the claim',
          baseDateLabel: 'Claim notice service date',
          daysFromBase: 30,
          isStatutory: true,
          isUrgent: false,
          isOverdue: false,
          status: 'pending'
        },
        {
          milestone: 'acquisition_date',
          title: 'Acquisition Date',
          description: 'RTM company takes control of management (minimum 3 months after claim notice)',
          baseDateLabel: 'Claim notice service date',
          daysFromBase: 90,
          isStatutory: true,
          isUrgent: false,
          isOverdue: false,
          status: 'pending'
        }
      ];

      // Update with actual data from timeline
      const progress = timelineData.progress;
      const milestones = timelineData.milestones;

      // Check which milestones are completed
      milestones.forEach(milestone => {
        const calc = calcs.find(c => c.milestone === milestone.milestone_type);
        if (calc && milestone.status === 'completed') {
          calc.status = 'completed';
          calc.baseDate = milestone.completed_date;
          calc.calculatedDate = milestone.completed_date;
        }
      });

      // Calculate dependent dates
      const claimNoticeDate = progress.claim_notice_served_date;
      if (claimNoticeDate) {
        const claimDate = new Date(claimNoticeDate);
        
        // Update counter-notice deadline
        const counterNoticeCalc = calcs.find(c => c.milestone === 'counter_notice_deadline');
        if (counterNoticeCalc) {
          counterNoticeCalc.baseDate = claimNoticeDate;
          const counterDate = new Date(claimDate);
          counterDate.setDate(counterDate.getDate() + 30);
          counterNoticeCalc.calculatedDate = counterDate.toISOString().split('T')[0];
          counterNoticeCalc.status = 'calculated';
          
          // Check if urgent or overdue
          const now = new Date();
          const daysUntil = Math.ceil((counterDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          counterNoticeCalc.isUrgent = daysUntil <= 7 && daysUntil > 0;
          counterNoticeCalc.isOverdue = daysUntil < 0;
        }

        // Update acquisition date
        const acquisitionCalc = calcs.find(c => c.milestone === 'acquisition_date');
        if (acquisitionCalc) {
          acquisitionCalc.baseDate = claimNoticeDate;
          const acquisitionDate = new Date(claimDate);
          acquisitionDate.setDate(acquisitionDate.getDate() + 90);
          acquisitionCalc.calculatedDate = acquisitionDate.toISOString().split('T')[0];
          acquisitionCalc.status = 'calculated';
        }
      }

      setCalculations(calcs);
    } catch (error) {
      console.error('Error loading deadline calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDate = (baseDate: string, daysOffset: number): string => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  const handleCalculateFromDate = () => {
    if (!selectedDate || !selectedMilestone) return;

    const updatedCalcs = calculations.map(calc => {
      if (calc.milestone === selectedMilestone) {
        return {
          ...calc,
          baseDate: selectedDate,
          calculatedDate: calculateDate(selectedDate, calc.daysFromBase),
          status: 'calculated' as const
        };
      }
      
      // Update dependent calculations
      if (selectedMilestone === 'claim_notice_served') {
        if (calc.milestone === 'counter_notice_deadline') {
          return {
            ...calc,
            baseDate: selectedDate,
            calculatedDate: calculateDate(selectedDate, 30),
            status: 'calculated' as const
          };
        }
        if (calc.milestone === 'acquisition_date') {
          return {
            ...calc,
            baseDate: selectedDate,
            calculatedDate: calculateDate(selectedDate, 90),
            status: 'calculated' as const
          };
        }
      }
      
      return calc;
    });

    setCalculations(updatedCalcs);
    
    const calc = updatedCalcs.find(c => c.milestone === selectedMilestone);
    if (calc?.calculatedDate) {
      onDateCalculated?.(selectedMilestone, calc.calculatedDate);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not calculated';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string, isUrgent: boolean, isOverdue: boolean) => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (isUrgent) {
      return <Clock className="h-5 w-5 text-orange-600" />;
    }
    if (status === 'calculated') {
      return <Target className="h-5 w-5 text-blue-600" />;
    }
    return <Calendar className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (status: string, isUrgent: boolean, isOverdue: boolean) => {
    if (status === 'completed') return 'border-green-200 bg-green-50';
    if (isOverdue) return 'border-red-200 bg-red-50';
    if (isUrgent) return 'border-orange-200 bg-orange-50';
    if (status === 'calculated') return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">RTM Deadline Calculator</h3>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Statutory Timeline Requirements</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Counter-notice period: Exactly 1 month (30 days) from claim notice service</li>
                  <li>• Acquisition date: Minimum 3 months (90 days) from claim notice service</li>
                  <li>• All dates are calculated from the actual service date, not preparation date</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Manual Date Calculator */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Calculate Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone
                </label>
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select milestone...</option>
                  <option value="claim_notice_served">Claim Notice Service Date</option>
                  <option value="company_formation">Company Formation Date</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleCalculateFromDate}
                  disabled={!selectedDate || !selectedMilestone}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Deadline Timeline */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Calculated Deadlines</h4>
          
          <div className="space-y-4">
            {calculations.map((calc, index) => (
              <div key={calc.milestone} className={`p-4 rounded-lg border-2 ${getStatusColor(calc.status, calc.isUrgent, calc.isOverdue)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getStatusIcon(calc.status, calc.isUrgent, calc.isOverdue)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900">{calc.title}</h5>
                        {calc.isStatutory && (
                          <Badge variant="warning" className="text-xs">Statutory</Badge>
                        )}
                        {calc.isUrgent && (
                          <Badge variant="warning" className="text-xs">Urgent</Badge>
                        )}
                        {calc.isOverdue && (
                          <Badge variant="danger" className="text-xs">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{calc.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Based on:</span>
                          <div className="font-medium">
                            {calc.baseDateLabel}
                            {calc.baseDate && (
                              <span className="text-gray-600 ml-2">
                                ({formatDate(calc.baseDate)})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Calculated date:</span>
                          <div className={`font-medium ${
                            calc.isOverdue ? 'text-red-600' : 
                            calc.isUrgent ? 'text-orange-600' : 
                            calc.status === 'completed' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {formatDate(calc.calculatedDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RTMDeadlineCalculator;
