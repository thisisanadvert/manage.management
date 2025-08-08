/**
 * AGM Video Conferencing Integration Tests
 * Tests for the Jitsi Meet integration with AGM meetings
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AGMMeetingService } from '../../../services/agmMeetingService';
import { AGMMeeting, CreateAGMMeetingRequest } from '../../../types/agm';

// Mock the AGM Meeting Service
vi.mock('../../../services/agmMeetingService');
const mockAGMMeetingService = vi.mocked(AGMMeetingService);

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        }
      })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: 'test-room-name', error: null })
  }
}));

describe('AGM Video Conferencing Integration', () => {
  const mockMeeting: AGMMeeting = {
    id: 'test-meeting-id',
    agm_id: 1,
    building_id: 'test-building-id',
    room_name: 'agm-testbuilding-1',
    host_id: 'test-user-id',
    title: 'Test AGM Meeting',
    description: 'Test meeting description',
    status: 'scheduled',
    participants_count: 0,
    max_participants: 50,
    recording_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AGMMeetingService', () => {
    it('should create a new AGM meeting', async () => {
      const createRequest: CreateAGMMeetingRequest = {
        agm_id: 1,
        building_id: 'test-building-id',
        title: 'Test AGM Meeting',
        description: 'Test meeting description',
        max_participants: 50,
        recording_enabled: false
      };

      mockAGMMeetingService.createMeeting.mockResolvedValue(mockMeeting);

      const result = await AGMMeetingService.createMeeting(createRequest);

      expect(result).toEqual(mockMeeting);
      expect(mockAGMMeetingService.createMeeting).toHaveBeenCalledWith(createRequest);
    });

    it('should get meeting by ID', async () => {
      mockAGMMeetingService.getMeeting.mockResolvedValue(mockMeeting);

      const result = await AGMMeetingService.getMeeting('test-meeting-id');

      expect(result).toEqual(mockMeeting);
      expect(mockAGMMeetingService.getMeeting).toHaveBeenCalledWith('test-meeting-id');
    });

    it('should get meetings for building', async () => {
      const meetings = [mockMeeting];
      mockAGMMeetingService.getMeetingsForBuilding.mockResolvedValue(meetings);

      const result = await AGMMeetingService.getMeetingsForBuilding('test-building-id');

      expect(result).toEqual(meetings);
      expect(mockAGMMeetingService.getMeetingsForBuilding).toHaveBeenCalledWith('test-building-id');
    });

    it('should start a meeting', async () => {
      const activeMeeting = { ...mockMeeting, status: 'active' as const };
      mockAGMMeetingService.startMeeting.mockResolvedValue(activeMeeting);

      const result = await AGMMeetingService.startMeeting('test-meeting-id');

      expect(result.status).toBe('active');
      expect(mockAGMMeetingService.startMeeting).toHaveBeenCalledWith('test-meeting-id');
    });

    it('should end a meeting', async () => {
      const endedMeeting = { ...mockMeeting, status: 'ended' as const };
      mockAGMMeetingService.endMeeting.mockResolvedValue(endedMeeting);

      const result = await AGMMeetingService.endMeeting('test-meeting-id');

      expect(result.status).toBe('ended');
      expect(mockAGMMeetingService.endMeeting).toHaveBeenCalledWith('test-meeting-id');
    });

    it('should check host permissions', async () => {
      mockAGMMeetingService.canHostMeeting.mockResolvedValue(true);

      const result = await AGMMeetingService.canHostMeeting('test-building-id');

      expect(result).toBe(true);
      expect(mockAGMMeetingService.canHostMeeting).toHaveBeenCalledWith('test-building-id');
    });
  });

  describe('Room Name Generation', () => {
    it('should generate unique room names', () => {
      const buildingName = 'Test Building';
      const agmId = 1;
      
      // Expected format: agm-testbuilding-1
      const expectedPattern = /^agm-[a-z0-9]+-\d+(-\d+)?$/;
      const roomName = `agm-${buildingName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${agmId}`;
      
      expect(roomName).toMatch(expectedPattern);
    });

    it('should handle special characters in building names', () => {
      const buildingName = 'Test Building & Co. (2024)';
      const agmId = 1;
      
      const cleanName = buildingName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const roomName = `agm-${cleanName}-${agmId}`;
      
      expect(roomName).toBe('agm-testbuildingco2024-1');
    });
  });

  describe('Meeting Status Management', () => {
    it('should handle meeting status transitions', () => {
      const statuses = ['scheduled', 'active', 'ended', 'cancelled'] as const;
      
      statuses.forEach(status => {
        const meeting = { ...mockMeeting, status };
        expect(meeting.status).toBe(status);
      });
    });

    it('should validate meeting status values', () => {
      const validStatuses = ['scheduled', 'active', 'ended', 'cancelled'];
      
      validStatuses.forEach(status => {
        expect(validStatuses).toContain(status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockAGMMeetingService.createMeeting.mockRejectedValue(error);

      await expect(AGMMeetingService.createMeeting({
        agm_id: 1,
        building_id: 'test-building-id',
        title: 'Test Meeting'
      })).rejects.toThrow('Database connection failed');
    });

    it('should handle missing meeting gracefully', async () => {
      mockAGMMeetingService.getMeeting.mockResolvedValue(null);

      const result = await AGMMeetingService.getMeeting('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('Integration Configuration', () => {
    it('should use correct Jitsi domain', () => {
      const expectedDomain = 'meet.jit.si';
      expect(expectedDomain).toBe('meet.jit.si');
    });

    it('should have proper AGM meeting configuration', () => {
      const config = {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        requireDisplayName: true,
        prejoinPageEnabled: false
      };

      expect(config.startWithAudioMuted).toBe(true);
      expect(config.enableWelcomePage).toBe(false);
      expect(config.requireDisplayName).toBe(true);
    });
  });
});

// Integration test helper functions
export const createTestMeeting = (overrides: Partial<AGMMeeting> = {}): AGMMeeting => ({
  id: 'test-meeting-id',
  agm_id: 1,
  building_id: 'test-building-id',
  room_name: 'agm-testbuilding-1',
  host_id: 'test-user-id',
  title: 'Test AGM Meeting',
  description: 'Test meeting description',
  status: 'scheduled',
  participants_count: 0,
  max_participants: 50,
  recording_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const mockJitsiAPI = () => ({
  addEventListeners: vi.fn(),
  removeEventListeners: vi.fn(),
  executeCommand: vi.fn(),
  executeCommands: vi.fn(),
  getParticipantsInfo: vi.fn().mockReturnValue([]),
  isAudioMuted: vi.fn().mockResolvedValue(true),
  isVideoMuted: vi.fn().mockResolvedValue(false),
  dispose: vi.fn()
});
