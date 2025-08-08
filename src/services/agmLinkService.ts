/**
 * AGM Link Service
 * Handles generation and management of secure, unique AGM meeting links
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { AGMMeeting } from '../types/agm';

export interface AGMLink {
  id: string;
  meeting_id: string;
  link_token: string;
  access_url: string;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAGMLinkRequest {
  meeting_id: string;
  expires_at?: string;
  max_uses?: number;
}

export class AGMLinkService {
  /**
   * Generate a unique, secure meeting link for an AGM
   */
  static async generateMeetingLink(request: CreateAGMLinkRequest): Promise<AGMLink> {
    try {
      // Generate a secure UUID token
      const linkToken = uuidv4();
      
      // Create the access URL
      const baseUrl = window.location.origin;
      const accessUrl = `${baseUrl}/agm/join/${linkToken}`;

      const linkData = {
        meeting_id: request.meeting_id,
        link_token: linkToken,
        access_url: accessUrl,
        expires_at: request.expires_at,
        max_uses: request.max_uses,
        current_uses: 0,
        is_active: true
      };

      const { data, error } = await supabase
        .from('agm_meeting_links')
        .insert(linkData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to generate meeting link: ${error.message}`);
      }

      return data as AGMLink;
    } catch (error) {
      console.error('Error generating AGM meeting link:', error);
      throw error;
    }
  }

  /**
   * Get meeting link by token
   */
  static async getMeetingByToken(token: string): Promise<{ meeting: AGMMeeting; link: AGMLink } | null> {
    try {
      const { data: linkData, error: linkError } = await supabase
        .from('agm_meeting_links')
        .select(`
          *,
          agm_meetings (*)
        `)
        .eq('link_token', token)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        return null;
      }

      const link = linkData as AGMLink;
      const meeting = linkData.agm_meetings as AGMMeeting;

      // Check if link has expired
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return null;
      }

      // Check if max uses exceeded
      if (link.max_uses && link.current_uses >= link.max_uses) {
        return null;
      }

      return { meeting, link };
    } catch (error) {
      console.error('Error getting meeting by token:', error);
      return null;
    }
  }

  /**
   * Increment link usage count
   */
  static async incrementLinkUsage(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agm_meeting_links')
        .update({
          current_uses: supabase.raw('current_uses + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId);

      if (error) {
        throw new Error(`Failed to increment link usage: ${error.message}`);
      }
    } catch (error) {
      console.error('Error incrementing link usage:', error);
      throw error;
    }
  }

  /**
   * Get all links for a meeting
   */
  static async getLinksForMeeting(meetingId: string): Promise<AGMLink[]> {
    try {
      const { data, error } = await supabase
        .from('agm_meeting_links')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get meeting links: ${error.message}`);
      }

      return data as AGMLink[];
    } catch (error) {
      console.error('Error getting meeting links:', error);
      throw error;
    }
  }

  /**
   * Deactivate a meeting link
   */
  static async deactivateLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agm_meeting_links')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId);

      if (error) {
        throw new Error(`Failed to deactivate link: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deactivating link:', error);
      throw error;
    }
  }

  /**
   * Generate a shareable link for homeowners
   */
  static async generateHomeownerLink(meetingId: string): Promise<string> {
    try {
      // Check if a link already exists for this meeting
      const existingLinks = await this.getLinksForMeeting(meetingId);
      const activeLink = existingLinks.find(link => 
        link.is_active && 
        (!link.expires_at || new Date(link.expires_at) > new Date())
      );

      if (activeLink) {
        return activeLink.access_url;
      }

      // Create a new link that expires 24 hours after the meeting
      const meeting = await this.getMeetingById(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const expiresAt = new Date(meeting.start_time || new Date());
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire 24 hours after meeting start

      const link = await this.generateMeetingLink({
        meeting_id: meetingId,
        expires_at: expiresAt.toISOString()
      });

      return link.access_url;
    } catch (error) {
      console.error('Error generating homeowner link:', error);
      throw error;
    }
  }

  /**
   * Get meeting by ID (helper method)
   */
  private static async getMeetingById(meetingId: string): Promise<AGMMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('agm_meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) {
        return null;
      }

      return data as AGMMeeting;
    } catch (error) {
      console.error('Error getting meeting by ID:', error);
      return null;
    }
  }

  /**
   * Validate link access for a user
   */
  static async validateLinkAccess(token: string, userId?: string): Promise<{
    isValid: boolean;
    meeting?: AGMMeeting;
    link?: AGMLink;
    reason?: string;
  }> {
    try {
      const result = await this.getMeetingByToken(token);
      
      if (!result) {
        return {
          isValid: false,
          reason: 'Invalid or expired link'
        };
      }

      const { meeting, link } = result;

      // Check if meeting is still accessible
      if (meeting.status === 'cancelled') {
        return {
          isValid: false,
          reason: 'Meeting has been cancelled'
        };
      }

      if (meeting.status === 'ended') {
        return {
          isValid: false,
          reason: 'Meeting has ended'
        };
      }

      // If user is provided, check if they have access to this building
      if (userId) {
        const { data: buildingAccess } = await supabase
          .from('building_users')
          .select('id')
          .eq('building_id', meeting.building_id)
          .eq('user_id', userId)
          .single();

        if (!buildingAccess) {
          return {
            isValid: false,
            reason: 'You do not have access to this building'
          };
        }
      }

      return {
        isValid: true,
        meeting,
        link
      };
    } catch (error) {
      console.error('Error validating link access:', error);
      return {
        isValid: false,
        reason: 'Error validating access'
      };
    }
  }
}
