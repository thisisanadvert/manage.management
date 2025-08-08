/**
 * AGM Migration Helper
 * Utility functions to help with AGM database setup and migration
 */

import { supabase } from '../lib/supabase';

export class AGMMigrationHelper {
  /**
   * Check if AGM tables exist in the database
   */
  static async checkTablesExist(): Promise<{
    agm_meetings: boolean;
    agm_meeting_participants: boolean;
    hasFunction: boolean;
  }> {
    try {
      // Check if agm_meetings table exists
      const { error: meetingsError } = await supabase
        .from('agm_meetings')
        .select('id')
        .limit(1);

      // Check if agm_meeting_participants table exists
      const { error: participantsError } = await supabase
        .from('agm_meeting_participants')
        .select('id')
        .limit(1);

      // Check if the room name generation function exists
      const { error: functionError } = await supabase
        .rpc('generate_agm_room_name', {
          p_building_id: '00000000-0000-0000-0000-000000000000',
          p_agm_id: 1
        });

      return {
        agm_meetings: !meetingsError || !meetingsError.message.includes('does not exist'),
        agm_meeting_participants: !participantsError || !participantsError.message.includes('does not exist'),
        hasFunction: !functionError || !functionError.message.includes('could not find function')
      };
    } catch (error) {
      console.error('Error checking AGM tables:', error);
      return {
        agm_meetings: false,
        agm_meeting_participants: false,
        hasFunction: false
      };
    }
  }

  /**
   * Get migration status and instructions
   */
  static async getMigrationStatus(): Promise<{
    isReady: boolean;
    missingComponents: string[];
    instructions: string[];
  }> {
    const status = await this.checkTablesExist();
    const missingComponents: string[] = [];
    const instructions: string[] = [];

    if (!status.agm_meetings) {
      missingComponents.push('agm_meetings table');
    }

    if (!status.agm_meeting_participants) {
      missingComponents.push('agm_meeting_participants table');
    }

    if (!status.hasFunction) {
      missingComponents.push('generate_agm_room_name function');
    }

    if (missingComponents.length > 0) {
      instructions.push(
        'AGM video conferencing database components are missing.',
        'Please apply the migration file:',
        'supabase/migrations/20250808000000_agm_meetings_schema.sql',
        '',
        'If using Supabase CLI locally:',
        '1. Run: npx supabase db reset',
        '2. Or run: npx supabase db push',
        '',
        'If using Supabase Dashboard:',
        '1. Go to SQL Editor in your Supabase project',
        '2. Copy and run the migration file contents',
        '',
        'The system will work with limited functionality until migration is applied.'
      );
    } else {
      instructions.push('All AGM video conferencing components are ready!');
    }

    return {
      isReady: missingComponents.length === 0,
      missingComponents,
      instructions
    };
  }

  /**
   * Display migration status in console (for development)
   */
  static async logMigrationStatus(): Promise<void> {
    const status = await this.getMigrationStatus();
    
    if (status.isReady) {
      console.log('✅ AGM Video Conferencing: All database components ready');
    } else {
      console.warn('⚠️ AGM Video Conferencing: Missing database components');
      console.warn('Missing:', status.missingComponents.join(', '));
      console.log('\nInstructions:');
      status.instructions.forEach(instruction => console.log(instruction));
    }
  }

  /**
   * Create a simple fallback table structure (emergency use only)
   * This is a minimal version that allows basic functionality
   */
  static async createFallbackTables(): Promise<{ success: boolean; error?: string }> {
    try {
      console.warn('Creating fallback AGM tables - this should only be used in development');
      
      // This is a simplified version for emergency use
      // The full migration should be applied instead
      const createTablesSQL = `
        -- Simplified AGM meetings table
        CREATE TABLE IF NOT EXISTS agm_meetings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agm_id INTEGER NOT NULL,
          building_id UUID NOT NULL,
          room_name VARCHAR(255) NOT NULL UNIQUE,
          host_id UUID NOT NULL,
          title VARCHAR(500) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
          participants_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Simplified participants table
        CREATE TABLE IF NOT EXISTS agm_meeting_participants (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          meeting_id UUID NOT NULL REFERENCES agm_meetings(id) ON DELETE CASCADE,
          display_name VARCHAR(255) NOT NULL,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE agm_meetings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE agm_meeting_participants ENABLE ROW LEVEL SECURITY;

        -- Basic RLS policies
        CREATE POLICY "Allow all for authenticated users" ON agm_meetings FOR ALL USING (auth.uid() IS NOT NULL);
        CREATE POLICY "Allow all for authenticated users" ON agm_meeting_participants FOR ALL USING (auth.uid() IS NOT NULL);
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Auto-check migration status in development
if (import.meta.env.DEV) {
  AGMMigrationHelper.logMigrationStatus().catch(console.error);
}
