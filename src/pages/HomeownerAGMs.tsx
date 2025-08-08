import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useEffectiveBuildingId } from '../contexts/BuildingContext';
import { AGMLinkService } from '../services/agmLinkService';

interface AGMInfo {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participants_count: number;
  max_participants: number;
  recording_enabled: boolean;
  host_name?: string;
}

const HomeownerAGMs: React.FC = () => {
  const { user } = useAuth();
  const buildingId = useEffectiveBuildingId();
  const [agms, setAGMs] = useState<AGMInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const loadAGMs = async () => {
      if (!buildingId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get AGM meetings for this building with host information
        const { data: meetings, error: meetingsError } = await supabase
          .from('agm_meetings')
          .select(`
            *,
            auth.users!agm_meetings_host_id_fkey (
              user_metadata
            )
          `)
          .eq('building_id', buildingId)
          .order('start_time', { ascending: false });

        if (meetingsError) {
          throw new Error(`Failed to load AGMs: ${meetingsError.message}`);
        }

        const agmsWithHostInfo = (meetings || []).map(meeting => ({
          ...meeting,
          host_name: meeting.auth?.users?.user_metadata?.full_name || 'Unknown Host'
        }));

        setAGMs(agmsWithHostInfo);
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

  const handleJoinAGM = async (agm: AGMInfo) => {
    try {
      // Get the meeting link and redirect to it
      const link = await AGMLinkService.generateHomeownerLink(agm.id);
      if (link) {
        // Extract the token from the link and navigate to the join page
        const token = link.split('/').pop();
        window.location.href = `/agm/join/${token}`;
      }
    } catch (error) {
      console.error('Error getting meeting link:', error);
      setError('Failed to get meeting link');
    }
  };

  const filteredAGMs = agms.filter(agm => {
    const matchesSearch = agm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agm.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'upcoming' && (agm.status === 'scheduled' || agm.status === 'active')) ||
                         (selectedFilter === 'past' && agm.status === 'ended');
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Annual General Meetings</h1>
            <p className="text-gray-600 mt-1">View and join building AGMs</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading AGMs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annual General Meetings</h1>
          <p className="text-gray-600 mt-1">View and join building AGMs</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Search AGMs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Meetings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* AGMs List */}
      <div className="space-y-4">
        {filteredAGMs.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedFilter !== 'all' ? 'No matching AGMs found' : 'No AGMs scheduled'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Annual General Meetings will appear here when scheduled by your building directors'
              }
            </p>
          </Card>
        ) : (
          filteredAGMs.map((agm) => {
            const { date, time } = formatDateTime(agm.start_time);
            
            return (
              <Card key={agm.id} hoverable className="animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    agm.status === 'active' ? 'bg-green-100' :
                    agm.status === 'scheduled' ? 'bg-accent-100' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`h-6 w-6 ${
                      agm.status === 'active' ? 'text-green-600' :
                      agm.status === 'scheduled' ? 'text-accent-600' : 'text-gray-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{agm.title}</h3>
                          {getStatusBadge(agm.status)}
                        </div>
                        {agm.description && (
                          <p className="text-gray-600 text-sm mb-2">{agm.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <span>{agm.participants_count} participants</span>
                          </div>
                          {agm.host_name && (
                            <div className="flex items-center">
                              <span>Hosted by {agm.host_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {agm.status === 'active' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Video size={16} />}
                          onClick={() => handleJoinAGM(agm)}
                        >
                          Join Live Meeting
                        </Button>
                      )}
                      {agm.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Calendar size={16} />}
                          onClick={() => handleJoinAGM(agm)}
                        >
                          View Meeting Details
                        </Button>
                      )}
                      {agm.status === 'ended' && agm.recording_enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Video size={16} />}
                        >
                          Watch Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HomeownerAGMs;
