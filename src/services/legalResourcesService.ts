/**
 * Legal Resources Service
 * Integration with external legal resources and dynamic updates
 */

export interface ExternalLegalResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'lease' | 'government' | 'tpi' | 'fpra' | 'legislation' | 'guidance';
  category: string;
  framework: string;
  lastUpdated: Date;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface LegalUpdate {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  source: string;
  publishedDate: Date;
  effectiveDate?: Date;
  framework: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  relatedResources: string[];
}

class LegalResourcesService {
  private static instance: LegalResourcesService;
  private resources: Map<string, ExternalLegalResource> = new Map();
  private updates: Map<string, LegalUpdate> = new Map();

  private constructor() {
    this.initializeResources();
    this.initializeSampleUpdates();
  }

  public static getInstance(): LegalResourcesService {
    if (!LegalResourcesService.instance) {
      LegalResourcesService.instance = new LegalResourcesService();
    }
    return LegalResourcesService.instance;
  }

  private initializeResources(): void {
    const resources: ExternalLegalResource[] = [
      // LEASE Resources
      {
        id: 'lease-main',
        title: 'Leasehold Advisory Service (LEASE)',
        description: 'Free government-funded service providing advice on residential leasehold and commonhold law',
        url: 'https://www.lease-advice.org',
        type: 'lease',
        category: 'general',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-11-01'),
        isActive: true,
        priority: 'high',
        tags: ['advice', 'leasehold', 'commonhold', 'free']
      },
      {
        id: 'lease-rtm-guide',
        title: 'LEASE Right to Manage Guide',
        description: 'Comprehensive guide to RTM procedures and requirements',
        url: 'https://www.lease-advice.org/advice-guide/right-to-manage/',
        type: 'lease',
        category: 'rtm',
        framework: 'CLRA_2002',
        lastUpdated: new Date('2024-10-15'),
        isActive: true,
        priority: 'high',
        tags: ['rtm', 'procedures', 'guide']
      },
      {
        id: 'lease-service-charges',
        title: 'LEASE Service Charges Guide',
        description: 'Detailed guidance on service charge law and procedures',
        url: 'https://www.lease-advice.org/advice-guide/service-charges/',
        type: 'lease',
        category: 'service_charges',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-11-01'),
        isActive: true,
        priority: 'high',
        tags: ['service-charges', 'consultation', 'section-20']
      },
      {
        id: 'lease-section-20',
        title: 'LEASE Section 20 Consultation Guide',
        description: 'Step-by-step guide to Section 20 consultation procedures',
        url: 'https://www.lease-advice.org/advice-guide/section-20-consultation/',
        type: 'lease',
        category: 'consultation',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-10-20'),
        isActive: true,
        priority: 'high',
        tags: ['section-20', 'consultation', 'major-works']
      },

      // Government Resources
      {
        id: 'gov-rtm',
        title: 'Gov.uk Right to Manage Your Building',
        description: 'Official government guidance on RTM procedures',
        url: 'https://www.gov.uk/right-to-manage-your-building',
        type: 'government',
        category: 'rtm',
        framework: 'CLRA_2002',
        lastUpdated: new Date('2024-09-15'),
        isActive: true,
        priority: 'high',
        tags: ['government', 'rtm', 'official']
      },
      {
        id: 'gov-leasehold-home',
        title: 'Gov.uk Leasehold Home Ownership',
        description: 'Government guidance for leasehold home owners',
        url: 'https://www.gov.uk/leasehold-property',
        type: 'government',
        category: 'general',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-10-01'),
        isActive: true,
        priority: 'medium',
        tags: ['leasehold', 'ownership', 'rights']
      },
      {
        id: 'gov-building-safety',
        title: 'Gov.uk Building Safety',
        description: 'Building Safety Act 2022 guidance and requirements',
        url: 'https://www.gov.uk/guidance/building-safety-act',
        type: 'government',
        category: 'building_safety',
        framework: 'BSA_2022',
        lastUpdated: new Date('2024-11-15'),
        isActive: true,
        priority: 'high',
        tags: ['building-safety', 'high-rise', 'compliance']
      },
      {
        id: 'companies-house',
        title: 'Companies House',
        description: 'Company registration, filing, and compliance requirements',
        url: 'https://www.gov.uk/government/organisations/companies-house',
        type: 'government',
        category: 'company_law',
        framework: 'CLRA_2002',
        lastUpdated: new Date('2024-10-30'),
        isActive: true,
        priority: 'high',
        tags: ['companies', 'filing', 'directors']
      },

      // TPI Resources
      {
        id: 'tpi-main',
        title: 'The Property Institute (TPI)',
        description: 'Professional body for property professionals with guidance and training',
        url: 'https://www.tpi.org.uk',
        type: 'tpi',
        category: 'professional',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-10-01'),
        isActive: true,
        priority: 'medium',
        tags: ['professional', 'training', 'standards']
      },

      // FPRA Resources
      {
        id: 'fpra-main',
        title: 'Federation of Private Residents\' Associations (FPRA)',
        description: 'Support and guidance for private residential management',
        url: 'https://www.fpra.org.uk',
        type: 'fpra',
        category: 'residents',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-09-20'),
        isActive: true,
        priority: 'medium',
        tags: ['residents', 'management', 'support']
      },

      // Legislation
      {
        id: 'legislation-lta-1985',
        title: 'Landlord and Tenant Act 1985',
        description: 'Full text of the Landlord and Tenant Act 1985',
        url: 'https://www.legislation.gov.uk/ukpga/1985/70',
        type: 'legislation',
        category: 'primary_legislation',
        framework: 'LTA_1985',
        lastUpdated: new Date('2024-06-01'),
        isActive: true,
        priority: 'high',
        tags: ['legislation', 'service-charges', 'consultation']
      },
      {
        id: 'legislation-clra-2002',
        title: 'Commonhold and Leasehold Reform Act 2002',
        description: 'Full text of the Commonhold and Leasehold Reform Act 2002',
        url: 'https://www.legislation.gov.uk/ukpga/2002/15',
        type: 'legislation',
        category: 'primary_legislation',
        framework: 'CLRA_2002',
        lastUpdated: new Date('2024-06-01'),
        isActive: true,
        priority: 'high',
        tags: ['legislation', 'rtm', 'commonhold']
      },
      {
        id: 'legislation-bsa-2022',
        title: 'Building Safety Act 2022',
        description: 'Full text of the Building Safety Act 2022',
        url: 'https://www.legislation.gov.uk/ukpga/2022/30',
        type: 'legislation',
        category: 'primary_legislation',
        framework: 'BSA_2022',
        lastUpdated: new Date('2024-06-01'),
        isActive: true,
        priority: 'high',
        tags: ['legislation', 'building-safety', 'high-rise']
      }
    ];

    resources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
  }

  private initializeSampleUpdates(): void {
    const updates: LegalUpdate[] = [
      {
        id: 'update-1',
        title: 'Building Safety Act 2022 - New Guidance Published',
        summary: 'HSE has published updated guidance on building safety compliance for high-rise residential buildings.',
        fullContent: 'The Health and Safety Executive has released comprehensive guidance on implementing the Building Safety Act 2022 requirements for buildings over 11 metres or 5 storeys. Key updates include clarification on Accountable Person duties, Building Safety Manager requirements, and resident engagement strategies.',
        source: 'HSE Building Safety Regulator',
        publishedDate: new Date('2024-11-20'),
        effectiveDate: new Date('2024-12-01'),
        framework: 'BSA_2022',
        impact: 'high',
        actionRequired: true,
        relatedResources: ['gov-building-safety', 'legislation-bsa-2022']
      },
      {
        id: 'update-2',
        title: 'Service Charge Consultation Regulations - Clarification',
        summary: 'LEASE has published clarification on Section 20 consultation procedures following recent tribunal decisions.',
        fullContent: 'Following several First-tier Tribunal decisions, LEASE has clarified the requirements for Section 20 consultations, particularly regarding the timing of notices and the content requirements for Notice of Intention and Notice of Proposal.',
        source: 'LEASE',
        publishedDate: new Date('2024-11-15'),
        framework: 'LTA_1985',
        impact: 'medium',
        actionRequired: false,
        relatedResources: ['lease-section-20', 'lease-service-charges']
      },
      {
        id: 'update-3',
        title: 'RTM Company Filing Requirements - Reminder',
        summary: 'Companies House reminds RTM companies of annual filing obligations and potential penalties.',
        fullContent: 'Companies House has issued a reminder that RTM companies must file their annual confirmation statements and accounts. Failure to file on time can result in penalties and potential company dissolution.',
        source: 'Companies House',
        publishedDate: new Date('2024-11-10'),
        framework: 'CLRA_2002',
        impact: 'medium',
        actionRequired: true,
        relatedResources: ['companies-house', 'lease-rtm-guide']
      }
    ];

    updates.forEach(update => {
      this.updates.set(update.id, update);
    });
  }

  public getResourcesByType(type: ExternalLegalResource['type']): ExternalLegalResource[] {
    return Array.from(this.resources.values()).filter(r => r.type === type && r.isActive);
  }

  public getResourcesByFramework(framework: string): ExternalLegalResource[] {
    return Array.from(this.resources.values()).filter(r => r.framework === framework && r.isActive);
  }

  public getResourcesByCategory(category: string): ExternalLegalResource[] {
    return Array.from(this.resources.values()).filter(r => r.category === category && r.isActive);
  }

  public getAllResources(): ExternalLegalResource[] {
    return Array.from(this.resources.values()).filter(r => r.isActive);
  }

  public getRecentUpdates(limit: number = 10): LegalUpdate[] {
    return Array.from(this.updates.values())
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, limit);
  }

  public getUpdatesByFramework(framework: string): LegalUpdate[] {
    return Array.from(this.updates.values()).filter(u => u.framework === framework);
  }

  public getHighImpactUpdates(): LegalUpdate[] {
    return Array.from(this.updates.values()).filter(u => u.impact === 'high');
  }

  public getUpdatesRequiringAction(): LegalUpdate[] {
    return Array.from(this.updates.values()).filter(u => u.actionRequired);
  }

  public searchResources(query: string): ExternalLegalResource[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.resources.values()).filter(r => 
      r.isActive && (
        r.title.toLowerCase().includes(lowercaseQuery) ||
        r.description.toLowerCase().includes(lowercaseQuery) ||
        r.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  }

  public getResourceById(id: string): ExternalLegalResource | undefined {
    return this.resources.get(id);
  }

  public getUpdateById(id: string): LegalUpdate | undefined {
    return this.updates.get(id);
  }
}

export default LegalResourcesService;
