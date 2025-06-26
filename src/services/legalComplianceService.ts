/**
 * Legal Compliance Service
 * Core service for managing legal compliance across the platform
 */

import {
  LegalRequirement,
  ComplianceItem,
  ComplianceAlert,
  LegalTemplate,
  ComplianceStatus,
  LegalFramework,
  UserRole,
  BuildingType,
  UK_PROPERTY_LAW
} from '../types/legal';
import { LEGAL_TEMPLATES } from '../data/legalTemplates';

export class LegalComplianceService {
  
  /**
   * Get all legal requirements applicable to a specific role and building type
   */
  static getApplicableRequirements(
    userRole: UserRole, 
    buildingType: BuildingType,
    buildingHeight?: number,
    buildingStoreys?: number
  ): LegalRequirement[] {
    const requirements = this.getAllRequirements();
    
    return requirements.filter(req => {
      // Check role applicability
      if (!req.applicableRoles.includes(userRole)) return false;
      
      // Check building type applicability
      if (!req.buildingTypes.includes(buildingType)) return false;
      
      // Special handling for building safety requirements
      if (req.framework === 'BSA_2022') {
        const isHighRise = (buildingHeight && buildingHeight >= UK_PROPERTY_LAW.BUILDING_SAFETY_HEIGHT_THRESHOLD) ||
                          (buildingStoreys && buildingStoreys >= UK_PROPERTY_LAW.BUILDING_SAFETY_STOREY_THRESHOLD);
        if (!isHighRise) return false;
      }
      
      return true;
    });
  }

  /**
   * Check compliance status for a building
   */
  static async checkBuildingCompliance(buildingId: string): Promise<{
    overall: ComplianceStatus;
    items: ComplianceItem[];
    alerts: ComplianceAlert[];
  }> {
    // This would integrate with your database
    // For now, returning mock data structure
    const items: ComplianceItem[] = [];
    const alerts: ComplianceAlert[] = [];
    
    // Calculate overall compliance status
    const statuses = items.map(item => item.status);
    let overall: ComplianceStatus = 'compliant';
    
    if (statuses.includes('non_compliant')) {
      overall = 'non_compliant';
    } else if (statuses.includes('at_risk')) {
      overall = 'at_risk';
    } else if (statuses.includes('unknown')) {
      overall = 'unknown';
    }
    
    return { overall, items, alerts };
  }

  /**
   * Generate compliance alerts for upcoming deadlines
   */
  static generateComplianceAlerts(
    buildingId: string, 
    requirements: LegalRequirement[]
  ): ComplianceAlert[] {
    const alerts: ComplianceAlert[] = [];
    const now = new Date();
    
    requirements.forEach(req => {
      if (req.deadline) {
        const daysUntilDeadline = Math.ceil(
          (req.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilDeadline <= 30 && daysUntilDeadline > 0) {
          alerts.push({
            id: `alert-${req.id}-${buildingId}`,
            type: 'deadline',
            severity: daysUntilDeadline <= 7 ? 'high' : 'medium',
            title: `${req.title} Due Soon`,
            description: `${req.title} is due in ${daysUntilDeadline} days`,
            requirementId: req.id,
            buildingId,
            dueDate: req.deadline,
            actionRequired: req.guidance.basic,
            createdAt: now,
            acknowledged: false
          });
        } else if (daysUntilDeadline <= 0) {
          alerts.push({
            id: `alert-overdue-${req.id}-${buildingId}`,
            type: 'overdue',
            severity: 'critical',
            title: `${req.title} Overdue`,
            description: `${req.title} was due ${Math.abs(daysUntilDeadline)} days ago`,
            requirementId: req.id,
            buildingId,
            dueDate: req.deadline,
            actionRequired: `Immediate action required: ${req.guidance.basic}`,
            createdAt: now,
            acknowledged: false
          });
        }
      }
    });
    
    return alerts;
  }

  /**
   * Get legal guidance for a specific requirement and user level
   */
  static getLegalGuidance(
    requirementId: string, 
    userLevel: 'basic' | 'intermediate' | 'advanced' = 'basic'
  ): string {
    const requirement = this.getRequirementById(requirementId);
    if (!requirement) return '';
    
    return requirement.guidance[userLevel];
  }

  /**
   * Get available legal templates for a user role
   */
  static getAvailableTemplates(userRole: UserRole): LegalTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(template => 
      template.applicableRoles.includes(userRole)
    );
  }

  /**
   * Process template with variables
   */
  static processTemplate(
    templateId: string, 
    variables: Record<string, any>
  ): string {
    const template = this.getTemplateById(templateId);
    if (!template) return '';
    
    let processedContent = template.content;
    
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || '';
      const placeholder = `{{${variable.name}}}`;
      processedContent = processedContent.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    });
    
    return processedContent;
  }

  /**
   * Get requirement by ID
   */
  private static getRequirementById(id: string): LegalRequirement | undefined {
    return this.getAllRequirements().find(req => req.id === id);
  }

  /**
   * Get template by ID
   */
  private static getTemplateById(id: string): LegalTemplate | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  /**
   * Get all legal requirements (would be loaded from database/config)
   */
  private static getAllRequirements(): LegalRequirement[] {
    // This would be loaded from a database or configuration file
    // For now, returning a subset of key requirements
    return [
      {
        id: 'section-20-consultation',
        title: 'Section 20 Consultation',
        description: 'Mandatory consultation for major works or long-term agreements over £250 per leaseholder',
        framework: 'LTA_1985',
        applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
        buildingTypes: ['rtm', 'share-of-freehold', 'landlord-managed'],
        mandatory: true,
        frequency: 'as_required',
        consequences: 'Costs may be limited to £250 per leaseholder if consultation not properly carried out',
        guidance: {
          basic: 'You must consult leaseholders before carrying out major works costing more than £250 per leaseholder',
          intermediate: 'Follow the two-stage consultation process: Notice of Intention, then Notice of Proposal with estimates',
          advanced: 'Ensure compliance with Service Charges (Consultation Requirements) (England) Regulations 2003'
        },
        externalResources: [
          {
            title: 'LEASE Section 20 Guidance',
            url: 'https://www.lease-advice.org/advice-guide/section-20-consultation/',
            type: 'lease',
            description: 'Comprehensive guide to Section 20 consultation requirements'
          }
        ],
        templates: ['section-20-notice-intention', 'section-20-notice-proposal']
      }
      // More requirements would be added here
    ];
  }

  /**
   * Get all legal templates
   */
  private static getAllTemplates(): LegalTemplate[] {
    // Import templates from the legal templates data file
    return LEGAL_TEMPLATES;
  }
}
