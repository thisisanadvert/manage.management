class RTMDataService {
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