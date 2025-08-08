import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Video,
  Download,
  Users,
  FileText,
  ChevronRight,
  CheckCircle2,
  Play,
  MessageSquare,
  VideoIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import JitsiMeetingRoom from '../components/agm/JitsiMeetingRoom';
import { useAuth } from '../contexts/AuthContext';
import { useEffectiveBuildingId } from '../contexts/BuildingContext';
import { AGMMeetingService } from '../services/agmMeetingService';
import { AGMMeeting, AGMData } from '../types/agm';
import { AGMMigrationHelper } from '../utils/agmMigrationHelper';

const AGMs = () => {
  const { user } = useAuth();
  const buildingId = useEffectiveBuildingId();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMeeting, setActiveMeeting] = useState<AGMMeeting | null>(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [agmMeetings, setAGMMeetings] = useState<{ [key: number]: AGMMeeting }>({});
  const [migrationStatus, setMigrationStatus] = useState<{
    isReady: boolean;
    missingComponents: string[];
    instructions: string[];
  } | null>(null);

  // Check if user can host meetings
  const canHostMeeting = user?.role === 'rtm-director' || user?.role === 'rmc-director';

  // Check migration status and load existing meetings for AGMs
  useEffect(() => {
    const loadAGMData = async () => {
      if (!buildingId) return;

      try {
        // Check if database is ready
        const status = await AGMMigrationHelper.getMigrationStatus();
        setMigrationStatus(status);

        // Only try to load meetings if database is ready
        if (status.isReady) {
          const meetings = await AGMMeetingService.getMeetingsForBuilding(buildingId);
          const meetingsMap: { [key: number]: AGMMeeting } = {};
          meetings.forEach(meeting => {
            meetingsMap[meeting.agm_id] = meeting;
          });
          setAGMMeetings(meetingsMap);
        }
      } catch (error) {
        console.error('Error loading AGM data:', error);
        setMeetingError('Failed to load AGM meeting data. Please refresh the page.');
      }
    };

    loadAGMData();
  }, [buildingId]);

  // Handle creating a new meeting
  const handleCreateMeeting = async (agm: AGMData) => {
    if (!buildingId || !canHostMeeting) return;

    setIsCreatingMeeting(true);
    setMeetingError(null);

    try {
      const meeting = await AGMMeetingService.createMeeting({
        agm_id: agm.id,
        building_id: buildingId,
        title: agm.title,
        description: agm.description,
        start_time: new Date().toISOString(), // Start immediately
        max_participants: 50,
        recording_enabled: true
      });

      setAGMMeetings(prev => ({ ...prev, [agm.id]: meeting }));
      setActiveMeeting(meeting);
    } catch (error) {
      console.error('Error creating meeting:', error);
      setMeetingError(error instanceof Error ? error.message : 'Failed to create meeting');
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  // Handle joining an existing meeting
  const handleJoinMeeting = async (agm: AGMData) => {
    const meeting = agmMeetings[agm.id];
    if (!meeting) return;

    try {
      // Join the meeting as a participant
      await AGMMeetingService.joinMeeting({
        meeting_id: meeting.id,
        display_name: user?.metadata?.firstName && user?.metadata?.lastName
          ? `${user.metadata.firstName} ${user.metadata.lastName}`
          : user?.email || 'Anonymous',
        email: user?.email,
        role: canHostMeeting ? 'host' : 'participant'
      });

      setActiveMeeting(meeting);
    } catch (error) {
      console.error('Error joining meeting:', error);
      setMeetingError(error instanceof Error ? error.message : 'Failed to join meeting');
    }
  };

  // Handle ending a meeting
  const handleEndMeeting = async () => {
    if (!activeMeeting) return;

    try {
      await AGMMeetingService.endMeeting(activeMeeting.id);
      setActiveMeeting(null);

      // Refresh meetings
      if (buildingId) {
        const meetings = await AGMMeetingService.getMeetingsForBuilding(buildingId);
        const meetingsMap: { [key: number]: AGMMeeting } = {};
        meetings.forEach(meeting => {
          meetingsMap[meeting.agm_id] = meeting;
        });
        setAGMMeetings(meetingsMap);
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
      setMeetingError(error instanceof Error ? error.message : 'Failed to end meeting');
    }
  };

  const agms: AGMData[] = [
    {
      id: 1,
      title: 'Annual General Meeting 2025',
      description: 'Annual review of building management, financial reports, and upcoming major works.',
      date: '2025-06-15',
      time: '19:00',
      location: 'Building Community Room',
      status: 'upcoming',
      documents: [
        { name: 'Agenda', type: 'pdf' },
        { name: 'Financial Report', type: 'pdf' },
        { name: 'Major Works Plan', type: 'pdf' }
      ],
      attendees: 18,
      totalEligible: 24
    },
    {
      id: 2,
      title: 'Extraordinary General Meeting - Major Works',
      description: 'Discussion and vote on proposed facade repairs and window replacement program.',
      date: '2025-03-15',
      time: '18:30',
      location: 'Virtual Meeting',
      status: 'completed',
      recording: 'https://example.com/recording',
      minutes: 'https://example.com/minutes',
      documents: [
        { name: 'Minutes', type: 'pdf' },
        { name: 'Presentation', type: 'pdf' },
        { name: 'Contractor Quotes', type: 'pdf' }
      ],
      attendees: 20,
      totalEligible: 24,
      decisions: [
        'Approved facade repairs budget of £85,000',
        'Selected contractor: BuildRight Ltd',
        'Works to commence July 2025'
      ]
    },
    {
      id: 3,
      title: 'Annual General Meeting 2024',
      description: 'Annual review including financial reports, management updates, and election of directors.',
      date: '2024-06-20',
      time: '19:00',
      location: 'Building Community Room',
      status: 'completed',
      recording: 'https://example.com/recording',
      minutes: 'https://example.com/minutes',
      documents: [
        { name: 'Minutes', type: 'pdf' },
        { name: 'Financial Report', type: 'pdf' },
        { name: 'Audit Report', type: 'pdf' }
      ],
      attendees: 22,
      totalEligible: 24,
      decisions: [
        'Approved annual accounts',
        'Re-elected board members',
        'Approved 2025 budget'
      ]
    },
    {
      id: 4,
      title: 'Extraordinary General Meeting - Security Upgrade',
      description: 'Special meeting to discuss and approve building security enhancement project.',
      date: '2024-09-10',
      time: '18:00',
      location: 'Virtual Meeting',
      status: 'completed',
      recording: 'https://example.com/recording',
      minutes: 'https://example.com/minutes',
      documents: [
        { name: 'Minutes', type: 'pdf' },
        { name: 'Security Proposal', type: 'pdf' },
        { name: 'Cost Analysis', type: 'pdf' }
      ],
      attendees: 19,
      totalEligible: 24,
      decisions: [
        'Approved security system upgrade',
        'Budget allocation of £25,000',
        'Implementation timeline approved'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'accent';
      case 'completed':
        return 'success';
      default:
        return 'gray';
    }
  };

  // Get meeting status for an AGM
  const getMeetingStatus = (agm: AGMData) => {
    const meeting = agmMeetings[agm.id];
    if (!meeting) return null;
    return meeting.status;
  };

  // Check if meeting is active
  const isMeetingActive = (agm: AGMData) => {
    const meeting = agmMeetings[agm.id];
    return meeting?.status === 'active';
  };

  // If there's an active meeting, show the meeting room
  if (activeMeeting && user) {
    const userDisplayName = user.metadata?.firstName && user.metadata?.lastName
      ? `${user.metadata.firstName} ${user.metadata.lastName}`
      : user.email || 'Anonymous';

    return (
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AGM Video Meeting</h1>
            <p className="text-gray-600 mt-1">{activeMeeting.title}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setActiveMeeting(null)}
          >
            Back to AGMs
          </Button>
        </div>

        {meetingError && (
          <Card>
            <div className="flex items-center p-4 text-red-700 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{meetingError}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setMeetingError(null)}
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        <JitsiMeetingRoom
          meeting={activeMeeting}
          userDisplayName={userDisplayName}
          userEmail={user.email}
          isHost={canHostMeeting}
          onMeetingEnd={handleEndMeeting}
          onError={(error) => setMeetingError(error.message)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annual General Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage building AGMs</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />}
          variant="primary"
        >
          Schedule AGM
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search AGMs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Meetings</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Past Meetings</option>
            </select>
            <Button 
              variant="outline"
              leftIcon={<Filter size={16} />}
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Migration Status Display */}
      {migrationStatus && !migrationStatus.isReady && (
        <Card>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Video Conferencing Setup Required
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  The AGM video conferencing feature requires database setup. Missing: {migrationStatus.missingComponents.join(', ')}
                </p>
                <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded font-mono">
                  <p className="font-semibold mb-1">To enable video conferencing:</p>
                  <p>1. Apply migration: supabase/migrations/20250808000000_agm_meetings_schema.sql</p>
                  <p>2. Or run: npx supabase db reset (if using local development)</p>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  AGMs will work normally, but video conferencing will be unavailable until setup is complete.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {meetingError && (
        <Card>
          <div className="flex items-center p-4 text-red-700 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{meetingError}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setMeetingError(null)}
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {agms.map((agm) => (
          <Card key={agm.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                agm.status === 'upcoming' ? 'bg-accent-100' : 'bg-success-100'
              }`}>
                <Calendar className={`h-5 w-5 ${
                  agm.status === 'upcoming' ? 'text-accent-600' : 'text-success-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusColor(agm.status)} size="sm">
                    {agm.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </Badge>

                  {/* Meeting Status Badge */}
                  {agmMeetings[agm.id] && (
                    <Badge
                      variant={isMeetingActive(agm) ? 'success' : 'gray'}
                      size="sm"
                    >
                      {isMeetingActive(agm) ? 'Meeting Active' : 'Meeting Available'}
                    </Badge>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>{agm.date} at {agm.time}</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium">{agm.title}</h3>
                <p className="mt-1 text-gray-600">{agm.description}</p>

                {agm.status === 'completed' && agm.decisions && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Key Decisions:</h4>
                    <ul className="space-y-1">
                      {agm.decisions.map((decision, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle2 size={16} className="text-success-500 mt-0.5 mr-2" />
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{agm.attendees}/{agm.totalEligible} Attendees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{agm.documents.length} Documents</span>
                  </div>
                  {agm.status === 'completed' && (
                    <>
                      <div className="flex items-center gap-1">
                        <Video size={14} />
                        <span>Recording Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>Minutes Available</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {agm.status === 'completed' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Play size={16} />}
                    >
                      Watch Recording
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Download size={16} />}
                    >
                      Download Minutes
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Video Meeting Actions - only show if database is ready */}
                    {migrationStatus?.isReady && canHostMeeting && !agmMeetings[agm.id] && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={isCreatingMeeting ? <Loader2 size={16} className="animate-spin" /> : <VideoIcon size={16} />}
                        onClick={() => handleCreateMeeting(agm)}
                        disabled={isCreatingMeeting}
                      >
                        {isCreatingMeeting ? 'Creating...' : 'Start Video Meeting'}
                      </Button>
                    )}

                    {migrationStatus?.isReady && agmMeetings[agm.id] && (
                      <>
                        {isMeetingActive(agm) ? (
                          <Button
                            variant="accent"
                            size="sm"
                            leftIcon={<Video size={16} />}
                            onClick={() => handleJoinMeeting(agm)}
                          >
                            Join Active Meeting
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Video size={16} />}
                            onClick={() => handleJoinMeeting(agm)}
                          >
                            Join Meeting
                          </Button>
                        )}

                        {canHostMeeting && (
                          <div className="text-xs text-gray-500 text-center">
                            Room: {agmMeetings[agm.id].room_name}
                          </div>
                        )}
                      </>
                    )}

                    {/* Show setup message for directors when database isn't ready */}
                    {!migrationStatus?.isReady && canHostMeeting && (
                      <div className="text-xs text-yellow-600 text-center p-2 bg-yellow-50 rounded">
                        Video conferencing requires database setup
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ChevronRight size={16} />}
                    >
                      View Details
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AGMs;