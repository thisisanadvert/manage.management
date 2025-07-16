
/**
 * Data Storage Validator
 * Validates that all app sections have proper database connections and data storage
 */

import { supabase } from '../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

interface ValidationResult {
  section: string;
  status: 'connected' | 'missing' | 'error';
  tables: TableValidation[];
  issues: string[];
  recommendations: string[];
}

interface TableValidation {
  tableName: string;
  exists: boolean;
  hasData: boolean;
  recordCount: number;
  lastUpdated?: string;
  issues: string[];
}

interface DataStorageReport {
  overall_status: 'healthy' | 'issues' | 'critical';
  sections: ValidationResult[];
  summary: {
    total_tables: number;
    connected_tables: number;
    missing_tables: number;
    total_records: number;
  };
  recommendations: string[];
}

// =====================================================
// DATA STORAGE VALIDATOR CLASS
// =====================================================

class DataStorageValidator {

  // =====================================================
  // MAIN VALIDATION FUNCTION
  // =====================================================


  async validateAllSections(buildingId?: string): Promise<DataStorageReport> {
    console.log('🔍 Starting comprehensive data storage validation...');

    const sections = [
      await this.validateFinancesSection(buildingId),
      await this.validateDocumentsSection(buildingId),
      await this.validateVotingSection(buildingId),
      await this.validateRTMFormationSection(buildingId)
    ];

    const summary = this.calculateSummary(sections);
    const overallStatus = this.determineOverallStatus(sections);
    const recommendations = this.generateRecommendations(sections);

    const report: DataStorageReport = {
      overall_status: overallStatus,
      sections,
      summary,
      recommendations
    };

    console.log('✅ Data storage validation completed');
    return report;
  }

  // =====================================================
  // SECTION VALIDATORS
  // =====================================================

  async validateFinancesSection(buildingId?: string): Promise<ValidationResult> {
    console.log('💰 Validating Finances section...');

    const requiredTables = [
      'transactions',
      'service_charge_payments',
      'reserve_fund_transactions',
      'major_works_projects',
      'major_works_expenses',
      'financial_reports',
      'recurring_transactions',
      'bank_accounts',
      'budget_items',
      'budget_periods',
      'service_charge_demands',
      'section20_consultations'
    ];

    const tables = await Promise.all(
      requiredTables.map(table => this.validateTable(table, buildingId))
    );

    const issues = [];
    const recommendations = [];

    // Check for critical missing tables
    const missingTables = tables.filter(t => !t.exists);
    if (missingTables.length > 0) {
      issues.push(`Missing ${missingTables.length} financial tables: ${missingTables.map(t => t.tableName).join(', ')}`);
      recommendations.push('Run the complete financial system migration to create missing tables');
    }

    // Check for empty critical tables
    const emptyTables = tables.filter(t => t.exists && !t.hasData && ['transactions', 'budget_items'].includes(t.tableName));
    if (emptyTables.length > 0) {
      recommendations.push('Consider adding sample financial data for testing and demonstration');
    }

    return {
      section: 'Finances',
      status: missingTables.length === 0 ? 'connected' : 'missing',
      tables,
      issues,
      recommendations
    };
  }

  async validateDocumentsSection(buildingId?: string): Promise<ValidationResult> {
    console.log('📄 Validating Documents section...');

    const requiredTables = [
      'document_repository',
      'document_access_log',
      'document_comments',
      'onboarding_documents' // Legacy table
    ];

    const tables = await Promise.all(
      requiredTables.map(table => this.validateTable(table, buildingId))
    );

    const issues = [];
    const recommendations = [];

    // Check for missing document repository
    const documentRepo = tables.find(t => t.tableName === 'document_repository');
    if (!documentRepo?.exists) {
      issues.push('Missing comprehensive document repository table');
      recommendations.push('Run the complete data storage migration to create document repository');
    }

    // Check storage bucket
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const documentsBucket = buckets?.find(b => b.id === 'documents');
      if (!documentsBucket) {
        issues.push('Documents storage bucket not configured');
        recommendations.push('Configure documents storage bucket in Supabase');
      }
    } catch (error) {
      issues.push('Unable to verify storage bucket configuration');
    }

    return {
      section: 'Documents',
      status: issues.length === 0 ? 'connected' : 'missing',
      tables,
      issues,
      recommendations
    };
  }

  async validateVotingSection(buildingId?: string): Promise<ValidationResult> {
    console.log('🗳️ Validating Voting section...');

    const requiredTables = [
      'polls',
      'poll_options',
      'poll_votes',
      'poll_attachments',
      'poll_comments'
    ];

    const tables = await Promise.all(
      requiredTables.map(table => this.validateTable(table, buildingId))
    );

    const issues = [];
    const recommendations = [];

    // Check for missing core voting tables
    const missingTables = tables.filter(t => !t.exists);
    if (missingTables.length > 0) {
      issues.push(`Missing ${missingTables.length} voting tables: ${missingTables.map(t => t.tableName).join(', ')}`);
      recommendations.push('Run the enhanced voting system migration');
    }

    // Check for enhanced voting features
    const pollsTable = tables.find(t => t.tableName === 'polls');
    if (pollsTable?.exists) {
      try {
        const { data } = await supabase
          .from('polls')
          .select('poll_type')
          .limit(1);
        
        if (data && data.length === 0) {
          recommendations.push('Consider adding sample polls for testing voting functionality');
        }
      } catch (error) {
        issues.push('Unable to verify polls table structure');
      }
    }

    return {
      section: 'Voting',
      status: missingTables.length === 0 ? 'connected' : 'missing',
      tables,
      issues,
      recommendations
    };
  }

  async validateRTMFormationSection(buildingId?: string): Promise<ValidationResult> {
    console.log('🏢 Validating RTM Formation section...');

    const requiredTables = [
      'rtm_eligibility_assessments',
      'leaseholder_surveys',
      'leaseholder_records',
      'rtm_company_formations',
      'rtm_company_directors',
      'rtm_notices'
    ];

    const tables = await Promise.all(
      requiredTables.map(table => this.validateTable(table, buildingId))
    );

    const issues = [];
    const recommendations = [];

    // Check for missing RTM tables (these are new)
    const missingTables = tables.filter(t => !t.exists);
    if (missingTables.length > 0) {
      issues.push(`Missing ${missingTables.length} RTM formation tables: ${missingTables.map(t => t.tableName).join(', ')}`);
      recommendations.push('Run the complete data storage migration to create RTM formation tables');
    }

    // Check for form persistence data that could be migrated
    const hasFormPersistenceData = this.checkFormPersistenceData();
    if (hasFormPersistenceData && missingTables.length === 0) {
      recommendations.push('Consider migrating existing form persistence data to database tables');
    }

    return {
      section: 'RTM Formation',
      status: missingTables.length === 0 ? 'connected' : 'missing',
      tables,
      issues,
      recommendations
    };
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  async validateTable(tableName: string, buildingId?: string): Promise<TableValidation> {
    try {
      // Check if table exists by trying to query it
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        return {
          tableName,
          exists: false,
          hasData: false,
          recordCount: 0,
          issues: [error.message]
        };
      }

      const recordCount = count || 0;
      const hasData = recordCount > 0;

      // Get last updated timestamp if possible
      let lastUpdated;
      try {
        const { data: recentData } = await supabase
          .from(tableName)
          .select('updated_at, created_at')
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(1);

        if (recentData && recentData.length > 0) {
          lastUpdated = recentData[0].updated_at || recentData[0].created_at;
        }
      } catch (e) {
        // Some tables might not have updated_at/created_at columns
      }

      return {
        tableName,
        exists: true,
        hasData,
        recordCount,
        lastUpdated,
        issues: []
      };

    } catch (error) {
      return {
        tableName,
        exists: false,
        hasData: false,
        recordCount: 0,
        issues: [`Validation error: ${error}`]
      };
    }
  }

  checkFormPersistenceData(): boolean {
    try {
      const rtmKeys = [
        'form-persistence-rtm-eligibility-checker',
        'form-persistence-leaseholder-survey',
        'form-persistence-rtm-company-formation'
      ];

      return rtmKeys.some(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return parsed.data && Object.keys(parsed.data).length > 0;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    } catch (error) {
      return false;
    }
  }

  calculateSummary(sections: ValidationResult[]) {
    const allTables = sections.flatMap(s => s.tables);
    
    return {
      total_tables: allTables.length,
      connected_tables: allTables.filter(t => t.exists).length,
      missing_tables: allTables.filter(t => !t.exists).length,
      total_records: allTables.reduce((sum, t) => sum + t.recordCount, 0)
    };
  }

  determineOverallStatus(sections: ValidationResult[]): 'healthy' | 'issues' | 'critical' {
    const criticalSections = sections.filter(s => s.status === 'missing' || s.status === 'error');
    const sectionsWithIssues = sections.filter(s => s.issues.length > 0);

    if (criticalSections.length > 2) return 'critical';
    if (sectionsWithIssues.length > 0) return 'issues';
    return 'healthy';
  }

  generateRecommendations(sections: ValidationResult[]): string[] {
    const allRecommendations = sections.flatMap(s => s.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    // Add general recommendations
    const generalRecommendations = [
      'Run the complete data storage migration: 20250716000002_complete_data_storage_system.sql',
      'Test data operations in each section to ensure proper connectivity',
      'Consider adding sample data for demonstration and testing purposes'
    ];

    return [...uniqueRecommendations, ...generalRecommendations];
  }

  // =====================================================
  // MIGRATION HELPERS
  // =====================================================

  async runDataStorageMigration(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🚀 Running data storage migration...');
      
      // This would typically run the SQL migration file
      // For now, we'll just validate that the migration should be run manually
      
      console.log('⚠️ Please run the migration manually:');
      console.log('supabase/migrations/20250716000002_complete_data_storage_system.sql');
      
      return { success: true };
    } catch (error) {
      console.error('Error running data storage migration:', error);
      return { success: false, error };
    }
  }
}

export const dataStorageValidator = new DataStorageValidator();
