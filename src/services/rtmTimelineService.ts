/**
 * Enhanced RTM Timeline Service
 * Manages RTM milestones, deadlines, evidence collection, and progress tracking
 */

import { supabase } from '../lib/supabase';

// Types for RTM Timeline System
export interface RTMMilestone {
  id?: string;
  building_id: string;
  created_by: string;
  milestone_type: 'eligibility_assessment' | 'company_formation' | 'claim_notice_served' | 'counter_notice_period' | 'acquisition_complete';
  milestone_title: string;
  milestone_description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  started_date?: string;
  completed_date?: string;
  target_completion_date?: string;
  statutory_deadline_days?: number;
  calculated_deadline?: string;
  evidence_required: boolean;
  evidence_description?: string;
  depends_on_milestone_id?: string;
  milestone_order: number;
  is_critical: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RTMEvidence {
  id?: string;
  milestone_id: string;
  building_id: string;
  uploaded_by: string;
  document_type: 'proof_of_postage' | 'service_certificate' | 'claim_notice_copy' | 'counter_notice' | 'companies_house_certificate' | 'bank_account_confirmation' | 'handover_documents' | 'other';
  document_title: string;
  document_description?: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  service_date?: string;
  service_method?: string;
  recipient_name?: string;
  recipient_address?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RTMTimelineProgress {
  id?: string;
  building_id: string;
  created_by: string;
  current_milestone_id?: string;
  overall_status: 'not_started' | 'eligibility_phase' | 'formation_phase' | 'notice_phase' | 'waiting_period' | 'acquisition_phase' | 'completed' | 'disputed' | 'abandoned';
  process_started_date?: string;
  claim_notice_served_date?: string;
  counter_notice_deadline?: string;
  acquisition_date?: string;
  process_completed_date?: string;
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  next_action_required?: string;
  next_deadline?: string;
  days_until_next_deadline?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RTMTimelineOverview {
  progress: RTMTimelineProgress;
  milestones: RTMMilestone[];
  currentMilestone?: RTMMilestone;
  nextDeadline?: {
    date: string;
    description: string;
    daysRemaining: number;
    isUrgent: boolean;
  };
  recentEvidence: RTMEvidence[];
}

class RTMTimelineService {
  private static instance: RTMTimelineService;

  public static getInstance(): RTMTimelineService {
    if (!RTMTimelineService.instance) {
      RTMTimelineService.instance = new RTMTimelineService();
    }
    return RTMTimelineService.instance;
  }

  /**
   * Initialize RTM timeline for a building with default milestones
   */
  async initializeRTMTimeline(buildingId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if timeline already exists
      const { data: existing } = await supabase
        .from('rtm_timeline_progress')
        .select('id')
        .eq('building_id', buildingId)
        .single();

      if (existing) {
        return { success: true }; // Already initialized
      }

      // Create default milestones
      const defaultMilestones: Omit<RTMMilestone, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          building_id: buildingId,
          created_by: userId,
          milestone_type: 'eligibility_assessment',
          milestone_title: 'Eligibility Assessment',
          milestone_description: 'Verify building qualifies for RTM and assess leaseholder interest',
          status: 'pending',
          evidence_required: true,
          evidence_description: 'Building lease documents, current management agreement, service charge accounts',
          milestone_order: 1,
          is_critical: true,
          statutory_deadline_days: 28
        },
        {
          building_id: buildingId,
          created_by: userId,
          milestone_type: 'company_formation',
          milestone_title: 'RTM Company Formation',
          milestone_description: 'Establish the RTM company and appoint directors',
          status: 'pending',
          evidence_required: true,
          evidence_description: 'Companies House incorporation certificate, articles of association, director appointments',
          milestone_order: 2,
          is_critical: true,
          statutory_deadline_days: 14
        },
        {
          building_id: buildingId,
          created_by: userId,
          milestone_type: 'claim_notice_served',
          milestone_title: 'Claim Notice Service',
          milestone_description: 'Serve formal RTM claim notice to landlord and qualifying tenants',
          status: 'pending',
          evidence_required: true,
          evidence_description: 'Proof of service certificates, claim notice copies, recipient lists',
          milestone_order: 3,
          is_critical: true,
          statutory_deadline_days: 7
        },
        {
          building_id: buildingId,
          created_by: userId,
          milestone_type: 'counter_notice_period',
          milestone_title: 'Counter-Notice Period',
          milestone_description: 'Wait for counter-notice period (1 month) and respond to any counter-notices',
          status: 'pending',
          evidence_required: false,
          evidence_description: 'Any counter-notices received, responses to counter-notices',
          milestone_order: 4,
          is_critical: true,
          statutory_deadline_days: 30
        },
        {
          building_id: buildingId,
          created_by: userId,
          milestone_type: 'acquisition_complete',
          milestone_title: 'Management Acquisition',
          milestone_description: 'Complete the transfer of management responsibilities',
          status: 'pending',
          evidence_required: true,
          evidence_description: 'Management handover documents, service charge account transfers, insurance transfers',
          milestone_order: 5,
          is_critical: true,
          statutory_deadline_days: 90
        }
      ];

      // Insert milestones
      const { error: milestonesError } = await supabase
        .from('rtm_milestones')
        .insert(defaultMilestones);

      if (milestonesError) {
        throw milestonesError;
      }

      // Initialize progress tracking
      const { error: progressError } = await supabase
        .from('rtm_timeline_progress')
        .insert({
          building_id: buildingId,
          created_by: userId,
          overall_status: 'not_started',
          total_milestones: defaultMilestones.length,
          completed_milestones: 0,
          progress_percentage: 0,
          next_action_required: 'Start eligibility assessment'
        });

      if (progressError) {
        throw progressError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error initializing RTM timeline:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get complete RTM timeline overview for a building
   */
  async getTimelineOverview(buildingId: string): Promise<RTMTimelineOverview | null> {
    try {
      // Get progress
      const { data: progress, error: progressError } = await supabase
        .from('rtm_timeline_progress')
        .select('*')
        .eq('building_id', buildingId)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Get milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from('rtm_milestones')
        .select('*')
        .eq('building_id', buildingId)
        .order('milestone_order', { ascending: true });

      if (milestonesError) {
        throw milestonesError;
      }

      // Get current milestone
      const currentMilestone = milestones?.find(m => m.id === progress.current_milestone_id);

      // Calculate next deadline info
      let nextDeadline = undefined;
      if (progress.next_deadline) {
        const deadlineDate = new Date(progress.next_deadline);
        const now = new Date();
        const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        nextDeadline = {
          date: progress.next_deadline,
          description: progress.next_action_required || 'Action required',
          daysRemaining,
          isUrgent: daysRemaining <= 7
        };
      }

      // Get recent evidence
      const { data: recentEvidence } = await supabase
        .from('rtm_evidence')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        progress,
        milestones: milestones || [],
        currentMilestone,
        nextDeadline,
        recentEvidence: recentEvidence || []
      };
    } catch (error) {
      console.error('Error getting timeline overview:', error);
      return null;
    }
  }

  /**
   * Complete a milestone and update timeline
   */
  async completeMilestone(
    milestoneId: string,
    completionDate: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update milestone status
      const { data: milestone, error: updateError } = await supabase
        .from('rtm_milestones')
        .update({
          status: 'completed',
          completed_date: completionDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Calculate deadlines for dependent milestones
      await this.updateDependentMilestones(milestone);

      // Update overall progress
      await this.updateTimelineProgress(milestone.building_id);

      return { success: true };
    } catch (error) {
      console.error('Error completing milestone:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Upload evidence for a milestone
   */
  async uploadEvidence(
    milestoneId: string,
    buildingId: string,
    userId: string,
    evidenceData: Omit<RTMEvidence, 'id' | 'milestone_id' | 'building_id' | 'uploaded_by' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; evidence?: RTMEvidence; error?: string }> {
    try {
      const { data: evidence, error } = await supabase
        .from('rtm_evidence')
        .insert({
          milestone_id: milestoneId,
          building_id: buildingId,
          uploaded_by: userId,
          ...evidenceData,
          verified: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, evidence };
    } catch (error) {
      console.error('Error uploading evidence:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Calculate and update deadlines for dependent milestones
   */
  private async updateDependentMilestones(completedMilestone: RTMMilestone): Promise<void> {
    try {
      const completionDate = new Date(completedMilestone.completed_date!);

      // Calculate deadlines based on milestone type
      let updates: Array<{ id: string; calculated_deadline: string; status?: string }> = [];

      switch (completedMilestone.milestone_type) {
        case 'claim_notice_served':
          // Update counter-notice period and acquisition deadlines
          const counterNoticeDeadline = new Date(completionDate);
          counterNoticeDeadline.setDate(counterNoticeDeadline.getDate() + 30);

          const acquisitionDeadline = new Date(completionDate);
          acquisitionDeadline.setDate(acquisitionDeadline.getDate() + 90);

          // Get dependent milestones
          const { data: dependentMilestones } = await supabase
            .from('rtm_milestones')
            .select('id, milestone_type')
            .eq('building_id', completedMilestone.building_id)
            .in('milestone_type', ['counter_notice_period', 'acquisition_complete']);

          dependentMilestones?.forEach(milestone => {
            if (milestone.milestone_type === 'counter_notice_period') {
              updates.push({
                id: milestone.id,
                calculated_deadline: counterNoticeDeadline.toISOString(),
                status: 'in_progress'
              });
            } else if (milestone.milestone_type === 'acquisition_complete') {
              updates.push({
                id: milestone.id,
                calculated_deadline: acquisitionDeadline.toISOString()
              });
            }
          });

          // Update timeline progress with key dates
          await supabase
            .from('rtm_timeline_progress')
            .update({
              claim_notice_served_date: completedMilestone.completed_date,
              counter_notice_deadline: counterNoticeDeadline.toISOString(),
              acquisition_date: acquisitionDeadline.toISOString(),
              overall_status: 'waiting_period'
            })
            .eq('building_id', completedMilestone.building_id);
          break;

        case 'company_formation':
          // Company formation enables claim notice service
          const { data: claimNoticeMilestone } = await supabase
            .from('rtm_milestones')
            .select('id')
            .eq('building_id', completedMilestone.building_id)
            .eq('milestone_type', 'claim_notice_served')
            .single();

          if (claimNoticeMilestone) {
            updates.push({
              id: claimNoticeMilestone.id,
              status: 'pending' // Now ready to proceed
            });
          }
          break;
      }

      // Apply updates
      for (const update of updates) {
        await supabase
          .from('rtm_milestones')
          .update({
            calculated_deadline: update.calculated_deadline,
            ...(update.status && { status: update.status }),
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating dependent milestones:', error);
    }
  }

  /**
   * Update overall timeline progress
   */
  private async updateTimelineProgress(buildingId: string): Promise<void> {
    try {
      // Use the database function to update progress
      await supabase.rpc('update_rtm_timeline_progress', {
        building_uuid: buildingId
      });
    } catch (error) {
      console.error('Error updating timeline progress:', error);
    }
  }

  /**
   * Get milestones for a building
   */
  async getMilestones(buildingId: string): Promise<RTMMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('rtm_milestones')
        .select('*')
        .eq('building_id', buildingId)
        .order('milestone_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  /**
   * Get evidence for a milestone
   */
  async getEvidenceForMilestone(milestoneId: string): Promise<RTMEvidence[]> {
    try {
      const { data, error } = await supabase
        .from('rtm_evidence')
        .select('*')
        .eq('milestone_id', milestoneId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting evidence:', error);
      return [];
    }
  }

  /**
   * Verify evidence document
   */
  async verifyEvidence(
    evidenceId: string,
    verifiedBy: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('rtm_evidence')
        .update({
          verified: true,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          verification_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', evidenceId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error verifying evidence:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get upcoming deadlines for a building
   */
  async getUpcomingDeadlines(buildingId: string, daysAhead: number = 30): Promise<Array<{
    milestone: RTMMilestone;
    daysRemaining: number;
    isOverdue: boolean;
    isUrgent: boolean;
  }>> {
    try {
      const { data: milestones, error } = await supabase
        .from('rtm_milestones')
        .select('*')
        .eq('building_id', buildingId)
        .not('calculated_deadline', 'is', null)
        .neq('status', 'completed')
        .order('calculated_deadline', { ascending: true });

      if (error) {
        throw error;
      }

      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return (milestones || [])
        .map(milestone => {
          const deadline = new Date(milestone.calculated_deadline!);
          const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return {
            milestone,
            daysRemaining,
            isOverdue: daysRemaining < 0,
            isUrgent: daysRemaining <= 7 && daysRemaining >= 0
          };
        })
        .filter(item => item.daysRemaining <= daysAhead);
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      return [];
    }
  }
}

export default RTMTimelineService;
