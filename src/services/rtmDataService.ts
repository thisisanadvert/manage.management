
/**
 * RTM Data Service
 * Handles all RTM Formation data operations and database interactions
 */

import { supabase } from '../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface RTMEligibilityAssessment {
  id?: string;
  building_id: string;
  user_id: string;
  assessment_data: Record<string, any>;
  eligibility_result: 'eligible' | 'not_eligible' | 'needs_review';
  eligibility_score?: number;
  issues_identified?: string[];
  recommendations?: string[];
  assessment_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaseholderSurvey {
  id?: string;
  building_id: string;
  created_by: string;
  survey_title: string;
  survey_description?: string;
  survey_template?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface LeaseholderRecord {
  id?: string;
  survey_id: string;
  building_id: string;
  flat_number: string;
  name: string;
  email?: string;
  phone?: string;
  contact_method: 'email' | 'phone' | 'post' | 'door';
  interested: 'yes' | 'no' | 'maybe' | 'pending';
  concerns?: string;
  response_date?: string;
  is_qualifying_tenant: boolean;
  lease_length_years?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RTMCompanyFormation {
  id?: string;
  building_id: string;
  created_by: string;
  proposed_name: string;
  alternative_names?: string[];
  registered_address?: string;
  company_secretary?: string;
  formation_status: 'planning' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  companies_house_number?: string;
  incorporation_date?: string;
  articles_generated: boolean;
  articles_data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface RTMCompanyDirector {
  id?: string;
  company_formation_id: string;
  name: string;
  flat_number: string;
  email: string;
  is_qualifying_tenant: boolean;
  has_consented: boolean;
  is_existing_user: boolean;
  invitation_sent: boolean;
  invitation_sent_at?: string;
  consent_received_at?: string;
  created_at?: string;
}

export interface RTMNotice {
  id?: string;
  building_id: string;
  company_formation_id?: string;
  created_by: string;
  notice_type: 'claim_notice' | 'counter_notice' | 'invitation_notice';
  notice_title: string;
  notice_content: string;
  recipient_type: 'landlord' | 'leaseholders' | 'management_company' | 'all';
  recipients?: Record<string, any>;
  served_date?: string;
  response_deadline?: string;
  status: 'draft' | 'ready' | 'served' | 'responded' | 'expired';
  file_path?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// RTM DATA SERVICE CLASS
// =====================================================

class RTMDataService {
  
  // =====================================================
  // ELIGIBILITY ASSESSMENTS
  // =====================================================


  async createEligibilityAssessment(assessment: RTMEligibilityAssessment): Promise<{ data: RTMEligibilityAssessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_eligibility_assessments')
        .insert([assessment])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating eligibility assessment:', error);
      return { data: null, error };
    }
  }

  async getEligibilityAssessments(buildingId: string): Promise<{ data: RTMEligibilityAssessment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_eligibility_assessments')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching eligibility assessments:', error);
      return { data: null, error };
    }
  }

  async updateEligibilityAssessment(id: string, updates: Partial<RTMEligibilityAssessment>): Promise<{ data: RTMEligibilityAssessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_eligibility_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating eligibility assessment:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // LEASEHOLDER SURVEYS
  // =====================================================

  async createLeaseholderSurvey(survey: LeaseholderSurvey): Promise<{ data: LeaseholderSurvey | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_surveys')
        .insert([survey])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating leaseholder survey:', error);
      return { data: null, error };
    }
  }

  async getLeaseholderSurveys(buildingId: string): Promise<{ data: LeaseholderSurvey[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_surveys')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching leaseholder surveys:', error);
      return { data: null, error };
    }
  }

  async updateLeaseholderSurvey(id: string, updates: Partial<LeaseholderSurvey>): Promise<{ data: LeaseholderSurvey | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_surveys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating leaseholder survey:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // LEASEHOLDER RECORDS
  // =====================================================

  async createLeaseholderRecord(record: LeaseholderRecord): Promise<{ data: LeaseholderRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_records')
        .insert([record])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating leaseholder record:', error);
      return { data: null, error };
    }
  }

  async getLeaseholderRecords(surveyId: string): Promise<{ data: LeaseholderRecord[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_records')
        .select('*')
        .eq('survey_id', surveyId)
        .order('flat_number');

      return { data, error };
    } catch (error) {
      console.error('Error fetching leaseholder records:', error);
      return { data: null, error };
    }
  }

  async updateLeaseholderRecord(id: string, updates: Partial<LeaseholderRecord>): Promise<{ data: LeaseholderRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating leaseholder record:', error);
      return { data: null, error };
    }
  }

  async deleteLeaseholderRecord(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('leaseholder_records')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting leaseholder record:', error);
      return { error };
    }
  }

  // =====================================================
  // RTM COMPANY FORMATION
  // =====================================================

  async createRTMCompanyFormation(formation: RTMCompanyFormation): Promise<{ data: RTMCompanyFormation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_formations')
        .insert([formation])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating RTM company formation:', error);
      return { data: null, error };
    }
  }

  async getRTMCompanyFormations(buildingId: string): Promise<{ data: RTMCompanyFormation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_formations')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching RTM company formations:', error);
      return { data: null, error };
    }
  }

  async updateRTMCompanyFormation(id: string, updates: Partial<RTMCompanyFormation>): Promise<{ data: RTMCompanyFormation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_formations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating RTM company formation:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // RTM COMPANY DIRECTORS
  // =====================================================

  async createRTMCompanyDirector(director: RTMCompanyDirector): Promise<{ data: RTMCompanyDirector | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_directors')
        .insert([director])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating RTM company director:', error);
      return { data: null, error };
    }
  }

  async getRTMCompanyDirectors(companyFormationId: string): Promise<{ data: RTMCompanyDirector[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_directors')
        .select('*')
        .eq('company_formation_id', companyFormationId)
        .order('created_at');

      return { data, error };
    } catch (error) {
      console.error('Error fetching RTM company directors:', error);
      return { data: null, error };
    }
  }

  async updateRTMCompanyDirector(id: string, updates: Partial<RTMCompanyDirector>): Promise<{ data: RTMCompanyDirector | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_company_directors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating RTM company director:', error);
      return { data: null, error };
    }
  }

  async deleteRTMCompanyDirector(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('rtm_company_directors')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting RTM company director:', error);
      return { error };
    }
  }

  // =====================================================
  // RTM NOTICES
  // =====================================================

  async createRTMNotice(notice: RTMNotice): Promise<{ data: RTMNotice | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_notices')
        .insert([notice])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating RTM notice:', error);
      return { data: null, error };
    }
  }

  async getRTMNotices(buildingId: string): Promise<{ data: RTMNotice[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_notices')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching RTM notices:', error);
      return { data: null, error };
    }
  }

  async updateRTMNotice(id: string, updates: Partial<RTMNotice>): Promise<{ data: RTMNotice | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rtm_notices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating RTM notice:', error);
      return { data: null, error };
    }
  }

  async deleteRTMNotice(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('rtm_notices')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting RTM notice:', error);
      return { error };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  async getRTMFormationProgress(buildingId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_rtm_formation_progress', { p_building_id: buildingId });

      return { data, error };
    } catch (error) {
      console.error('Error getting RTM formation progress:', error);
      return { data: null, error };
    }
  }

  async getLeaseholderSurveyStats(surveyId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('leaseholder_records')
        .select('interested')
        .eq('survey_id', surveyId);

      if (error) throw error;

      const stats = {
        total: data.length,
        responded: data.filter(r => r.interested !== 'pending').length,
        interested: data.filter(r => r.interested === 'yes').length,
        notInterested: data.filter(r => r.interested === 'no').length,
        maybe: data.filter(r => r.interested === 'maybe').length,
        pending: data.filter(r => r.interested === 'pending').length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting leaseholder survey stats:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // MIGRATION HELPERS
  // =====================================================

  /**
   * Migrate form persistence data to database
   * This helps transition from localStorage to database storage
   */
  async migrateFormPersistenceData(userId: string, buildingId: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Check for existing form persistence data in localStorage
      const eligibilityData = localStorage.getItem('form-persistence-rtm-eligibility-checker');
      const surveyData = localStorage.getItem('form-persistence-leaseholder-survey');
      const formationData = localStorage.getItem('form-persistence-rtm-company-formation');

      let migratedCount = 0;

      // Migrate eligibility data
      if (eligibilityData) {
        try {
          const parsed = JSON.parse(eligibilityData);
          if (parsed.data && Object.keys(parsed.data).length > 0) {
            await this.createEligibilityAssessment({
              building_id: buildingId,
              user_id: userId,
              assessment_data: parsed.data,
              eligibility_result: 'needs_review', // Default status for migrated data
              eligibility_score: 0.5
            });
            migratedCount++;
          }
        } catch (e) {
          console.warn('Could not migrate eligibility data:', e);
        }
      }

      // Migrate survey data
      if (surveyData) {
        try {
          const parsed = JSON.parse(surveyData);
          if (parsed.data && parsed.data.leaseholders && parsed.data.leaseholders.length > 0) {
            // Create survey
            const { data: survey } = await this.createLeaseholderSurvey({
              building_id: buildingId,
              created_by: userId,
              survey_title: 'Migrated Survey',
              survey_description: 'Survey data migrated from form persistence',
              survey_template: parsed.data.surveyTemplate || '',
              status: 'draft'
            });

            if (survey) {
              // Create leaseholder records
              for (const leaseholder of parsed.data.leaseholders) {
                await this.createLeaseholderRecord({
                  survey_id: survey.id!,
                  building_id: buildingId,
                  flat_number: leaseholder.flatNumber || '',
                  name: leaseholder.name || '',
                  email: leaseholder.email || '',
                  phone: leaseholder.phone || '',
                  contact_method: leaseholder.contactMethod || 'email',
                  interested: leaseholder.interested || 'pending',
                  concerns: leaseholder.concerns || '',
                  is_qualifying_tenant: true
                });
              }
              migratedCount++;
            }
          }
        } catch (e) {
          console.warn('Could not migrate survey data:', e);
        }
      }

      // Migrate formation data
      if (formationData) {
        try {
          const parsed = JSON.parse(formationData);
          if (parsed.data && (parsed.data.proposedName || parsed.data.directors?.length > 0)) {
            // Create company formation
            const { data: formation } = await this.createRTMCompanyFormation({
              building_id: buildingId,
              created_by: userId,
              proposed_name: parsed.data.proposedName || 'Migrated Company',
              alternative_names: parsed.data.alternativeNames || [],
              registered_address: parsed.data.registeredAddress || '',
              company_secretary: parsed.data.companySecretary || '',
              formation_status: 'planning',
              articles_generated: false,
              articles_data: parsed.data.articlesData || {}
            });

            if (formation && parsed.data.directors) {
              // Create directors
              for (const director of parsed.data.directors) {
                await this.createRTMCompanyDirector({
                  company_formation_id: formation.id!,
                  name: director.name || '',
                  flat_number: director.flatNumber || '',
                  email: director.email || '',
                  is_qualifying_tenant: director.isQualifyingTenant !== false,
                  has_consented: director.hasConsented || false,
                  is_existing_user: director.isExistingUser || false,
                  invitation_sent: director.invitationSent || false
                });
              }
            }
            migratedCount++;
          }
        } catch (e) {
          console.warn('Could not migrate formation data:', e);
        }
      }

      return { success: true, migratedCount };
    } catch (error) {
      console.error('Error migrating form persistence data:', error);
      return { success: false, error };
    }
  }
}

export const rtmDataService = new RTMDataService();
