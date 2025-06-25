/**
 * Legal Compliance Framework Types
 * Comprehensive type definitions for UK property law compliance
 */

export type LegalFramework = 
  | 'LTA_1985' // Landlord and Tenant Act 1985
  | 'LTA_1987' // Landlord and Tenant Act 1987
  | 'CLRA_2002' // Commonhold and Leasehold Reform Act 2002
  | 'BSA_2022' // Building Safety Act 2022
  | 'LFRA_2024' // Leasehold and Freehold Reform Act 2024
  | 'GDPR_2018' // General Data Protection Regulation
  | 'FIRE_SAFETY_2021' // Fire Safety Act 2021
  | 'BUILDING_REGS' // Building Regulations
  | 'HEALTH_SAFETY'; // Health and Safety at Work Act

export type ComplianceStatus = 
  | 'compliant'
  | 'at_risk'
  | 'non_compliant'
  | 'unknown'
  | 'pending_review';

export type ComplianceLevel = 'basic' | 'intermediate' | 'advanced';

export interface LegalRequirement {
  id: string;
  title: string;
  description: string;
  framework: LegalFramework;
  applicableRoles: UserRole[];
  buildingTypes: BuildingType[];
  mandatory: boolean;
  deadline?: Date;
  frequency?: 'annual' | 'biannual' | 'monthly' | 'as_required';
  consequences: string;
  guidance: {
    basic: string;
    intermediate: string;
    advanced: string;
  };
  externalResources: ExternalResource[];
  templates?: string[];
}

export interface ComplianceItem {
  id: string;
  requirementId: string;
  buildingId: string;
  status: ComplianceStatus;
  lastReviewed?: Date;
  nextDue?: Date;
  assignedTo?: string;
  notes?: string;
  evidence?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: 'government' | 'lease' | 'tpi' | 'fpra' | 'legislation' | 'guidance';
  description: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  framework: LegalFramework;
  applicableRoles: UserRole[];
  content: string;
  variables: TemplateVariable[];
  lastUpdated: Date;
  version: string;
}

export type TemplateCategory = 
  | 'section_20_consultation'
  | 'service_charge_demand'
  | 'rtm_notice'
  | 'agm_notice'
  | 'meeting_minutes'
  | 'privacy_notice'
  | 'building_safety'
  | 'fire_safety'
  | 'insurance_notice';

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'boolean' | 'address' | 'currency';
  required: boolean;
  description: string;
  defaultValue?: string;
}

export type UserRole = 
  | 'rtm-director'
  | 'rmc-director'
  | 'leaseholder'
  | 'shareholder'
  | 'management-company'
  | 'super-admin';

export type BuildingType = 
  | 'rtm'
  | 'share-of-freehold'
  | 'landlord-managed'
  | 'mixed-use'
  | 'high-rise'; // Over 11m/5 storeys

export interface LegalGuidance {
  id: string;
  title: string;
  content: {
    basic: string;
    intermediate: string;
    advanced: string;
  };
  applicableRoles: UserRole[];
  framework: LegalFramework;
  lastUpdated: Date;
  tags: string[];
}

export interface ComplianceAlert {
  id: string;
  type: 'deadline' | 'overdue' | 'review_required' | 'legislative_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  requirementId: string;
  buildingId: string;
  dueDate?: Date;
  actionRequired: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface LegalUpdate {
  id: string;
  title: string;
  description: string;
  framework: LegalFramework;
  effectiveDate: Date;
  impact: 'low' | 'medium' | 'high';
  affectedFeatures: string[];
  actionRequired: boolean;
  guidance: string;
  publishedAt: Date;
}

// UK Property Law Constants
export const UK_PROPERTY_LAW = {
  SECTION_20_THRESHOLD: 250, // £250 per leaseholder
  SECTION_20_MAJOR_WORKS_THRESHOLD: 250, // £250 per leaseholder
  BUILDING_SAFETY_HEIGHT_THRESHOLD: 11, // 11 metres
  BUILDING_SAFETY_STOREY_THRESHOLD: 5, // 5 storeys
  RTM_MINIMUM_PARTICIPATION: 0.5, // 50% of qualifying tenants
  SERVICE_CHARGE_DEMAND_NOTICE_PERIOD: 18, // 18 months
  AGM_NOTICE_PERIOD: 21, // 21 days minimum
  GDPR_DATA_RETENTION_PERIOD: 6, // 6 years for financial records
} as const;

// Legal Framework Mappings
export const LEGAL_FRAMEWORK_INFO: Record<LegalFramework, {
  title: string;
  description: string;
  url: string;
}> = {
  LTA_1985: {
    title: 'Landlord and Tenant Act 1985',
    description: 'Service charges, consultation requirements, and tenant rights',
    url: 'https://www.legislation.gov.uk/ukpga/1985/70'
  },
  LTA_1987: {
    title: 'Landlord and Tenant Act 1987',
    description: 'Right of first refusal and tenant management rights',
    url: 'https://www.legislation.gov.uk/ukpga/1987/31'
  },
  CLRA_2002: {
    title: 'Commonhold and Leasehold Reform Act 2002',
    description: 'Right to Manage and leasehold enfranchisement',
    url: 'https://www.legislation.gov.uk/ukpga/2002/15'
  },
  BSA_2022: {
    title: 'Building Safety Act 2022',
    description: 'Building safety requirements for high-rise buildings',
    url: 'https://www.legislation.gov.uk/ukpga/2022/30'
  },
  LFRA_2024: {
    title: 'Leasehold and Freehold Reform Act 2024',
    description: 'Latest reforms to leasehold and freehold law',
    url: 'https://www.legislation.gov.uk/ukpga/2024/22'
  },
  GDPR_2018: {
    title: 'General Data Protection Regulation 2018',
    description: 'Data protection and privacy requirements',
    url: 'https://ico.org.uk/for-organisations/guide-to-data-protection/'
  },
  FIRE_SAFETY_2021: {
    title: 'Fire Safety Act 2021',
    description: 'Fire safety requirements for residential buildings',
    url: 'https://www.legislation.gov.uk/ukpga/2021/24'
  },
  BUILDING_REGS: {
    title: 'Building Regulations',
    description: 'Building standards and safety requirements',
    url: 'https://www.gov.uk/building-regulations-approval'
  },
  HEALTH_SAFETY: {
    title: 'Health and Safety at Work Act 1974',
    description: 'Health and safety obligations for building management',
    url: 'https://www.legislation.gov.uk/ukpga/1974/37'
  }
};

// External Resource URLs
export const EXTERNAL_RESOURCES = {
  LEASE: 'https://www.lease-advice.org',
  TPI: 'https://www.tpi.org.uk',
  FPRA: 'https://www.fpra.org.uk',
  GOV_UK_LEASEHOLD: 'https://www.gov.uk/leasehold-property',
  GOV_UK_RTM: 'https://www.gov.uk/right-to-manage-your-building',
  BUILDING_SAFETY_REGULATOR: 'https://www.hse.gov.uk/building-safety/',
  ICO_GDPR: 'https://ico.org.uk/for-organisations/guide-to-data-protection/'
} as const;
