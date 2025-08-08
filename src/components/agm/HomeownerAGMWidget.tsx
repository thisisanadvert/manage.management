import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useEffectiveBuildingId } from '../../contexts/BuildingContext';
import { useNavigate } from 'react-router-dom';

interface AGMInfo {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participants_count: number;
  max_participants: number;
  recording_enabled: boolean;
}

const HomeownerAGMWidget: React.FC = () => {
  const { user } = useAuth();
  const buildingId = useEffectiveBuildingId();
  const navigate = useNavigate();
  const [agms, setAGMs] = useState<AGMInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAGMs = async () => {
      if (!buildingId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get AGM meetings for this building
        const { data: meetings, error: meetingsError } = await supabase
          .from('agm_meetings')
          .select('*')
          .eq('building_id', buildingId)
          .in('status', ['scheduled', 'active'])
          .order('start_time', { ascending: true })
          .limit(3);

        if (meetingsError) {
          throw new Error(`Failed to load AGMs: ${meetingsError.message}`);
        }

        setAGMs(meetings || []);
      } catch (error) {
        console.error('Error loading AGMs:', error);
        setError(error instanceof Error ? error.message : 'Failed to load AGMs');
      } finally {
        setIsLoading(false);
      }
    };

    loadAGMs();
  }, [buildingId]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { date: dateStr, time: timeStr };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="accent" size="sm">Scheduled</Badge>;
      case 'active':
        return <Badge variant="success" size="sm">Live Now</Badge>;
      case 'ended':
        return <Badge variant="gray" size="sm">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="warning" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="gray" size="sm">{status}</Badge>;
    }
  };

  const handleJoinAGM = (agm: AGMInfo) => {
    // Navigate to the AGM page where they can join
    navigate('/leaseholder/agms');
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming AGMs
          </h2>
        </div>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading AGMs...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming AGMs
          </h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Upcoming AGMs
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/leaseholder/agms')}
        >
          View All
        </Button>
      </div>

      {agms.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming AGMs</h3>
          <p className="mt-1 text-sm text-gray-500">
            Annual General Meetings will appear here when scheduled
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agms.map((agm) => {
            const { date, time } = formatDateTime(agm.start_time);
            
            return (
              <div key={agm.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{agm.title}</h3>
                      {getStatusBadge(agm.status)}
                    </div>
                    {agm.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agm.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{agm.participants_count} joined</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {agm.status === 'active' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Video size={16} />}
                        onClick={() => handleJoinAGM(agm)}
                      >
                        Join Now
                      </Button>
                    )}
                    {agm.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<FileText size={16} />}
                        onClick={() => handleJoinAGM(agm)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {agms.length > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/leaseholder/agms')}
                className="w-full"
              >
                View all AGMs
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default HomeownerAGMWidget;
