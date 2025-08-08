import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Shield,
  User,
  MoreVertical
} from 'lucide-react';
import { AGMMeetingParticipant } from '../../types/agm';
import { AGMMeetingService } from '../../services/agmMeetingService';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface AGMParticipantListProps {
  meetingId: string;
  isHost: boolean;
  className?: string;
}

const AGMParticipantList: React.FC<AGMParticipantListProps> = ({
  meetingId,
  isHost,
  className = ''
}) => {
  const [participants, setParticipants] = useState<AGMMeetingParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setIsLoading(true);
        const participantList = await AGMMeetingService.getMeetingParticipants(meetingId);
        setParticipants(participantList);
      } catch (err) {
        console.error('Error loading participants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load participants');
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();

    // Refresh participants every 30 seconds
    const interval = setInterval(loadParticipants, 30000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown size={16} className="text-yellow-500" />;
      case 'moderator':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <User size={16} className="text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'host':
        return 'warning';
      case 'moderator':
        return 'secondary';
      default:
        return 'gray';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Removed unused function getParticipantStatus

  const activeParticipants = participants.filter(p => !p.left_at);
  const leftParticipants = participants.filter(p => p.left_at);

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading participants...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="text-center text-red-600">
            <p>Error loading participants: {error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users size={20} className="mr-2" />
            Participants ({activeParticipants.length})
          </h3>
        </div>

        {/* Active Participants */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Active ({activeParticipants.length})</h4>
          {activeParticipants.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active participants</p>
          ) : (
            <div className="space-y-2">
              {activeParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(participant.role)}
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {participant.display_name}
                        </span>
                        <Badge 
                          variant={getRoleBadgeVariant(participant.role)} 
                          size="sm"
                        >
                          {participant.role}
                        </Badge>
                      </div>
                      
                      {participant.email && (
                        <p className="text-xs text-gray-500">{participant.email}</p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Joined {participant.joined_at ? 
                          new Date(participant.joined_at).toLocaleTimeString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  </div>

                  {isHost && participant.role !== 'host' && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<MoreVertical size={14} />}
                      >
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Previously Left Participants */}
        {leftParticipants.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Previously Joined ({leftParticipants.length})
            </h4>
            <div className="space-y-2">
              {leftParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-25 rounded-lg opacity-75"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(participant.role)}
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">
                          {participant.display_name}
                        </span>
                        <Badge variant="gray" size="sm">
                          {participant.role}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Duration: {formatDuration(participant.duration_minutes)}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Left {participant.left_at ? 
                          new Date(participant.left_at).toLocaleTimeString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              <p className="text-sm text-gray-500">Total Joined</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeParticipants.length}</p>
              <p className="text-sm text-gray-500">Currently Active</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AGMParticipantList;
