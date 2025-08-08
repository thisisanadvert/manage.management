/**
 * AGM Meeting Service
 * Handles AGM video meeting lifecycle, database operations, and Jitsi integration
 */

import { supabase } from '../lib/supabase';
import { 
  AGMMeeting, 
  AGMMeetingParticipant, 
  CreateAGMMeetingRequest, 
  UpdateAGMMeetingRequest,
  JoinMeetingRequest,
  AGMMeetingStatus 
} from '../types/agm';

export class AGMMeetingService {
  /**
   * Create a new AGM meeting
   */
  static async createMeeting(request: CreateAGMMeetingRequest): Promise<AGMMeeting> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate unique room name - try database function first, fallback to client-side generation
      let roomName: string;

      try {
        const { data: roomNameData, error: roomNameError } = await supabase
          .rpc('generate_agm_room_name', {
            p_building_id: request.building_id,
            p_agm_id: request.agm_id
          });

        if (roomNameError) {
          throw new Error(`Database function error: ${roomNameError.message}`);
        }

        roomName = roomNameData as string;
      } catch (dbError) {
        console.warn('Database function not available, using client-side room name generation:', dbError);
        // Fallback to client-side room name generation
        roomName = await this.generateRoomNameClientSide(request.building_id, request.agm_id);
      }

      // Create meeting record
      const meetingData = {
        agm_id: request.agm_id,
        building_id: request.building_id,
        room_name: roomName,
        host_id: user.id,
        title: request.title,
        description: request.description,
        start_time: request.start_time,
        end_time: request.end_time,
        max_participants: request.max_participants || 50,
        recording_enabled: request.recording_enabled || false,
        meeting_password: request.meeting_password,
        status: 'scheduled' as AGMMeetingStatus
      };

      const { data, error } = await supabase
        .from('agm_meetings')
        .insert(meetingData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meeting: ${error.message}`);
      }

      return data as AGMMeeting;
    } catch (error) {
      console.error('Error creating AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Get AGM meeting by ID
   */
  static async getMeeting(meetingId: string): Promise<AGMMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Meeting not found
        }
        throw new Error(`Failed to get meeting: ${error.message}`);
      }

      return data as AGMMeeting;
    } catch (error) {
      console.error('Error getting AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Get AGM meetings for a building
   */
  static async getMeetingsForBuilding(buildingId: string): Promise<AGMMeeting[]> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get meetings: ${error.message}`);
      }

      return data as AGMMeeting[];
    } catch (error) {
      console.error('Error getting AGM meetings for building:', error);
      throw error;
    }
  }

  /**
   * Get AGM meeting by AGM ID and building ID
   */
  static async getMeetingByAGMId(agmId: number, buildingId: string): Promise<AGMMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .select('*')
        .eq('agm_id', agmId)
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to get meeting: ${error.message}`);
      }

      return data as AGMMeeting | null;
    } catch (error) {
      console.error('Error getting AGM meeting by AGM ID:', error);
      throw error;
    }
  }

  /**
   * Update AGM meeting
   */
  static async updateMeeting(meetingId: string, updates: UpdateAGMMeetingRequest): Promise<AGMMeeting> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meeting: ${error.message}`);
      }

      return data as AGMMeeting;
    } catch (error) {
      console.error('Error updating AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Start AGM meeting (update status to active)
   */
  static async startMeeting(meetingId: string): Promise<AGMMeeting> {
    try {
      const updates: UpdateAGMMeetingRequest = {
        status: 'active',
        actual_start_time: new Date().toISOString()
      };

      return await this.updateMeeting(meetingId, updates);
    } catch (error) {
      console.error('Error starting AGM meeting:', error);
      throw error;
    }
  }

  /**
   * End AGM meeting (update status to ended)
   */
  static async endMeeting(meetingId: string): Promise<AGMMeeting> {
    try {
      const updates: UpdateAGMMeetingRequest = {
        status: 'ended',
        actual_end_time: new Date().toISOString()
      };

      return await this.updateMeeting(meetingId, updates);
    } catch (error) {
      console.error('Error ending AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Join AGM meeting as participant
   */
  static async joinMeeting(request: JoinMeetingRequest): Promise<AGMMeetingParticipant> {
    try {
      // Get current user (optional for anonymous participants)
      const { data: { user } } = await supabase.auth.getUser();

      const participantData = {
        meeting_id: request.meeting_id,
        user_id: user?.id || null,
        display_name: request.display_name,
        email: request.email,
        role: request.role || 'participant',
        joined_at: new Date().toISOString(),
        is_anonymous: request.is_anonymous || !user,
        user_agent: navigator.userAgent
      };

      const { data, error } = await supabase
        .from('agm_meeting_participants')
        .insert(participantData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to join meeting: ${error.message}`);
      }

      // Update participant count
      await this.updateParticipantCount(request.meeting_id);

      return data as AGMMeetingParticipant;
    } catch (error) {
      console.error('Error joining AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Leave AGM meeting
   */
  static async leaveMeeting(meetingId: string, participantId?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('agm_meeting_participants')
        .update({ 
          left_at: new Date().toISOString()
        })
        .eq('meeting_id', meetingId)
        .is('left_at', null); // Only update if not already left

      if (participantId) {
        query = query.eq('id', participantId);
      } else if (user) {
        query = query.eq('user_id', user.id);
      } else {
        throw new Error('Cannot identify participant to remove');
      }

      const { error } = await query;

      if (error) {
        throw new Error(`Failed to leave meeting: ${error.message}`);
      }

      // Update participant count
      await this.updateParticipantCount(meetingId);
    } catch (error) {
      console.error('Error leaving AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting participants
   */
  static async getMeetingParticipants(meetingId: string): Promise<AGMMeetingParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('agm_meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get participants: ${error.message}`);
      }

      return data as AGMMeetingParticipant[];
    } catch (error) {
      console.error('Error getting meeting participants:', error);
      throw error;
    }
  }

  /**
   * Update participant count for a meeting
   */
  private static async updateParticipantCount(meetingId: string): Promise<void> {
    try {
      // Count active participants (joined but not left)
      const { count, error: countError } = await supabase
        .from('agm_meeting_participants')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meetingId)
        .not('joined_at', 'is', null)
        .is('left_at', null);

      if (countError) {
        throw new Error(`Failed to count participants: ${countError.message}`);
      }

      // Update meeting participant count
      const { error: updateError } = await supabase
        .from('agm_meetings')
        .update({ participants_count: count || 0 })
        .eq('id', meetingId);

      if (updateError) {
        throw new Error(`Failed to update participant count: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Error updating participant count:', error);
      // Don't throw here as this is a background operation
    }
  }

  /**
   * Delete AGM meeting
   */
  static async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agm_meetings')
        .delete()
        .eq('id', meetingId);

      if (error) {
        throw new Error(`Failed to delete meeting: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting AGM meeting:', error);
      throw error;
    }
  }

  /**
   * Check if user can host meetings for a building
   */
  static async canHostMeeting(buildingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user is a director for this building
      const { data, error } = await supabase
        .from('building_users')
        .select('role')
        .eq('building_id', buildingId)
        .eq('user_id', user.id)
        .single();

      if (error) return false;

      return data?.role === 'rtm-director' || data?.role === 'rmc-director';
    } catch (error) {
      console.error('Error checking host permissions:', error);
      return false;
    }
  }

  /**
   * Generate room name on client side (fallback when database function is not available)
   */
  private static async generateRoomNameClientSide(buildingId: string, agmId: number): Promise<string> {
    try {
      // Get building name
      const { data: building, error: buildingError } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .single();

      if (buildingError) {
        console.warn('Could not fetch building name, using building ID:', buildingError);
        // Use building ID as fallback
        const cleanBuildingId = buildingId.replace(/[^a-z0-9]/gi, '').toLowerCase();
        return `agm-${cleanBuildingId.substring(0, 8)}-${agmId}`;
      }

      // Clean building name for room name
      const cleanBuildingName = building.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20); // Limit length

      // Generate base room name
      let roomName = `agm-${cleanBuildingName}-${agmId}`;
      let counter = 1;
      let finalRoomName = roomName;

      // Ensure uniqueness by checking existing meetings
      while (await this.roomNameExists(finalRoomName)) {
        finalRoomName = `${roomName}-${counter}`;
        counter++;

        // Prevent infinite loop
        if (counter > 100) {
          finalRoomName = `agm-${Date.now()}-${agmId}`;
          break;
        }
      }

      return finalRoomName;
    } catch (error) {
      console.error('Error generating room name client-side:', error);
      // Ultimate fallback - use timestamp
      return `agm-${Date.now()}-${agmId}`;
    }
  }

  /**
   * Check if room name already exists
   */
  private static async roomNameExists(roomName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .select('id')
        .eq('room_name', roomName)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error checking room name existence:', error);
        return false; // Assume it doesn't exist if we can't check
      }

      return data !== null;
    } catch (error) {
      console.warn('Error checking room name existence:', error);
      return false;
    }
  }
}
