/**
 * Legal Accuracy Service
 * Manages legal accuracy review processes and legislative change tracking
 */

import { LegalFramework } from '../types/legal';

export interface LegalReviewItem {
  id: string;
  title: string;
  description: string;
  framework: LegalFramework;
  category: 'template' | 'guidance' | 'process' | 'compliance_rule';
  currentVersion: string;
  lastReviewed: Date;
  nextReviewDue: Date;
  reviewStatus: 'current' | 'review_needed' | 'outdated' | 'under_review';
  assignedReviewer?: string;
  reviewNotes?: string;
  relatedLegislation: string[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface LegislativeChange {
  id: string;
  title: string;
  description: string;
  framework: LegalFramework;
  changeType: 'amendment' | 'new_legislation' | 'regulation' | 'guidance_update' | 'case_law';
  effectiveDate: Date;
  announcedDate: Date;
  source: string;
  impactAssessment: string;
  affectedComponents: string[];
  actionRequired: boolean;
  implementationDeadline?: Date;
  status: 'announced' | 'pending' | 'implemented' | 'monitoring';
}

export interface ReviewProcess {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'ad_hoc';
  reviewers: string[];
  checklistItems: Array<{
    item: string;
    mandatory: boolean;
    completed: boolean;
  }>;
  lastCompleted?: Date;
  nextDue: Date;
}

class LegalAccuracyService {
  private static instance: LegalAccuracyService;
  private reviewItems: Map<string, LegalReviewItem> = new Map();
  private legislativeChanges: Map<string, LegislativeChange> = new Map();
  private reviewProcesses: Map<string, ReviewProcess> = new Map();

  private constructor() {
    this.initializeReviewItems();
    this.initializeLegislativeChanges();
    this.initializeReviewProcesses();
  }

  public static getInstance(): LegalAccuracyService {
    if (!LegalAccuracyService.instance) {
      LegalAccuracyService.instance = new LegalAccuracyService();
    }
    return LegalAccuracyService.instance;
  }

  private initializeReviewItems(): void {
    const reviewItems: LegalReviewItem[] = [
      {
        id: 'section-20-templates',
        title: 'Section 20 Consultation Templates',
        description: 'Notice of Intention and Notice of Proposal templates',
        framework: 'LTA_1985',
        category: 'template',
        currentVersion: '2.1',
        lastReviewed: new Date('2024-11-01'),
        nextReviewDue: new Date('2025-05-01'),
        reviewStatus: 'current',
        relatedLegislation: ['LTA 1985', 'Service Charges Regulations 2003'],
        impactLevel: 'critical'
      },
      {
        id: 'rtm-guidance',
        title: 'RTM Formation Guidance',
        description: 'Step-by-step RTM formation process guidance',
        framework: 'CLRA_2002',
        category: 'guidance',
        currentVersion: '1.3',
        lastReviewed: new Date('2024-10-15'),
        nextReviewDue: new Date('2025-04-15'),
        reviewStatus: 'current',
        relatedLegislation: ['CLRA 2002', 'Companies Act 2006'],
        impactLevel: 'high'
      },
      {
        id: 'building-safety-compliance',
        title: 'Building Safety Compliance Rules',
        description: 'BSA 2022 compliance monitoring and requirements',
        framework: 'BSA_2022',
        category: 'compliance_rule',
        currentVersion: '1.0',
        lastReviewed: new Date('2024-11-20'),
        nextReviewDue: new Date('2025-02-20'),
        reviewStatus: 'review_needed',
        relatedLegislation: ['BSA 2022', 'Building Regulations'],
        impactLevel: 'critical'
      },
      {
        id: 'gdpr-templates',
        title: 'GDPR Privacy Notice Templates',
        description: 'Data protection and privacy notice templates',
        framework: 'GDPR_2018',
        category: 'template',
        currentVersion: '1.0',
        lastReviewed: new Date('2024-12-01'),
        nextReviewDue: new Date('2025-06-01'),
        reviewStatus: 'current',
        relatedLegislation: ['GDPR 2018', 'Data Protection Act 2018'],
        impactLevel: 'high'
      }
    ];

    reviewItems.forEach(item => {
      this.reviewItems.set(item.id, item);
    });
  }

  private initializeLegislativeChanges(): void {
    const changes: LegislativeChange[] = [
      {
        id: 'lfra-2024-implementation',
        title: 'Leasehold and Freehold Reform Act 2024 Implementation',
        description: 'New legislation affecting leasehold reform and ground rent restrictions',
        framework: 'LFRA_2024',
        changeType: 'new_legislation',
        effectiveDate: new Date('2024-06-24'),
        announcedDate: new Date('2024-05-24'),
        source: 'UK Parliament',
        impactAssessment: 'Significant changes to leasehold law including ground rent restrictions and enhanced leaseholder rights',
        affectedComponents: ['service-charge-templates', 'lease-guidance', 'rtm-processes'],
        actionRequired: true,
        implementationDeadline: new Date('2025-01-01'),
        status: 'pending'
      },
      {
        id: 'bsa-2022-guidance-update',
        title: 'Building Safety Act 2022 - Updated HSE Guidance',
        description: 'HSE published updated guidance on building safety compliance',
        framework: 'BSA_2022',
        changeType: 'guidance_update',
        effectiveDate: new Date('2024-12-01'),
        announcedDate: new Date('2024-11-20'),
        source: 'HSE Building Safety Regulator',
        impactAssessment: 'Clarifications on Accountable Person duties and resident engagement requirements',
        affectedComponents: ['building-safety-compliance', 'high-rise-guidance'],
        actionRequired: true,
        implementationDeadline: new Date('2024-12-31'),
        status: 'announced'
      },
      {
        id: 'section-20-tribunal-decisions',
        title: 'Recent First-tier Tribunal Decisions on Section 20',
        description: 'Key tribunal decisions affecting Section 20 consultation procedures',
        framework: 'LTA_1985',
        changeType: 'case_law',
        effectiveDate: new Date('2024-11-01'),
        announcedDate: new Date('2024-11-01'),
        source: 'First-tier Tribunal (Property Chamber)',
        impactAssessment: 'Clarifications on notice timing and content requirements for consultations',
        affectedComponents: ['section-20-templates', 'consultation-guidance'],
        actionRequired: false,
        status: 'monitoring'
      }
    ];

    changes.forEach(change => {
      this.legislativeChanges.set(change.id, change);
    });
  }

  private initializeReviewProcesses(): void {
    const processes: ReviewProcess[] = [
      {
        id: 'quarterly-template-review',
        name: 'Quarterly Template Review',
        description: 'Comprehensive review of all legal templates for accuracy and compliance',
        frequency: 'quarterly',
        reviewers: ['legal-team', 'property-law-specialist'],
        checklistItems: [
          { item: 'Review all Section 20 templates against current regulations', mandatory: true, completed: false },
          { item: 'Check RTM templates for legislative updates', mandatory: true, completed: false },
          { item: 'Verify GDPR compliance in privacy templates', mandatory: true, completed: false },
          { item: 'Update building safety compliance requirements', mandatory: true, completed: false },
          { item: 'Review external resource links for accuracy', mandatory: false, completed: false }
        ],
        lastCompleted: new Date('2024-09-01'),
        nextDue: new Date('2024-12-01')
      },
      {
        id: 'annual-framework-review',
        name: 'Annual Legal Framework Review',
        description: 'Comprehensive annual review of entire legal compliance framework',
        frequency: 'annually',
        reviewers: ['senior-legal-counsel', 'property-law-expert', 'compliance-officer'],
        checklistItems: [
          { item: 'Review all legal frameworks for legislative changes', mandatory: true, completed: false },
          { item: 'Update compliance monitoring rules', mandatory: true, completed: false },
          { item: 'Assess effectiveness of legal guidance system', mandatory: true, completed: false },
          { item: 'Review and update external resource integrations', mandatory: true, completed: false },
          { item: 'Conduct user feedback analysis on legal features', mandatory: false, completed: false },
          { item: 'Update legal training materials', mandatory: false, completed: false }
        ],
        nextDue: new Date('2025-01-01')
      },
      {
        id: 'legislative-change-monitoring',
        name: 'Legislative Change Monitoring',
        description: 'Ongoing monitoring of legislative changes and their impact',
        frequency: 'monthly',
        reviewers: ['legal-team'],
        checklistItems: [
          { item: 'Monitor government consultations and announcements', mandatory: true, completed: false },
          { item: 'Review tribunal decisions and case law updates', mandatory: true, completed: false },
          { item: 'Check for regulatory guidance updates', mandatory: true, completed: false },
          { item: 'Assess impact on existing templates and guidance', mandatory: true, completed: false },
          { item: 'Update legislative change tracking system', mandatory: true, completed: false }
        ],
        lastCompleted: new Date('2024-11-01'),
        nextDue: new Date('2024-12-01')
      }
    ];

    processes.forEach(process => {
      this.reviewProcesses.set(process.id, process);
    });
  }

  public getReviewItemsNeedingAttention(): LegalReviewItem[] {
    const now = new Date();
    return Array.from(this.reviewItems.values()).filter(item => 
      item.reviewStatus === 'review_needed' || 
      item.reviewStatus === 'outdated' ||
      item.nextReviewDue <= now
    );
  }

  public getPendingLegislativeChanges(): LegislativeChange[] {
    return Array.from(this.legislativeChanges.values()).filter(change => 
      change.status === 'announced' || change.status === 'pending'
    );
  }

  public getOverdueReviewProcesses(): ReviewProcess[] {
    const now = new Date();
    return Array.from(this.reviewProcesses.values()).filter(process => 
      process.nextDue <= now
    );
  }

  public updateReviewItemStatus(id: string, status: LegalReviewItem['reviewStatus'], notes?: string): void {
    const item = this.reviewItems.get(id);
    if (item) {
      item.reviewStatus = status;
      item.lastReviewed = new Date();
      if (notes) {
        item.reviewNotes = notes;
      }
      // Set next review date based on impact level
      const monthsToAdd = item.impactLevel === 'critical' ? 3 : 
                         item.impactLevel === 'high' ? 6 : 12;
      item.nextReviewDue = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
      this.reviewItems.set(id, item);
    }
  }

  public markLegislativeChangeImplemented(id: string): void {
    const change = this.legislativeChanges.get(id);
    if (change) {
      change.status = 'implemented';
      this.legislativeChanges.set(id, change);
    }
  }

  public completeReviewProcess(id: string): void {
    const process = this.reviewProcesses.get(id);
    if (process) {
      process.lastCompleted = new Date();
      // Set next due date based on frequency
      const now = new Date();
      switch (process.frequency) {
        case 'monthly':
          process.nextDue = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
        case 'quarterly':
          process.nextDue = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
          break;
        case 'biannually':
          process.nextDue = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
          break;
        case 'annually':
          process.nextDue = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          break;
      }
      // Reset checklist
      process.checklistItems.forEach(item => item.completed = false);
      this.reviewProcesses.set(id, process);
    }
  }

  public getAccuracySummary(): {
    totalReviewItems: number;
    itemsNeedingReview: number;
    pendingChanges: number;
    overdueProcesses: number;
    overallAccuracyScore: number;
  } {
    const totalItems = this.reviewItems.size;
    const needingReview = this.getReviewItemsNeedingAttention().length;
    const pendingChanges = this.getPendingLegislativeChanges().length;
    const overdueProcesses = this.getOverdueReviewProcesses().length;
    
    // Calculate accuracy score based on review status
    const currentItems = Array.from(this.reviewItems.values()).filter(item => 
      item.reviewStatus === 'current'
    ).length;
    const accuracyScore = totalItems > 0 ? Math.round((currentItems / totalItems) * 100) : 100;

    return {
      totalReviewItems: totalItems,
      itemsNeedingReview: needingReview,
      pendingChanges,
      overdueProcesses,
      overallAccuracyScore: accuracyScore
    };
  }

  public getAllReviewItems(): LegalReviewItem[] {
    return Array.from(this.reviewItems.values());
  }

  public getAllLegislativeChanges(): LegislativeChange[] {
    return Array.from(this.legislativeChanges.values());
  }

  public getAllReviewProcesses(): ReviewProcess[] {
    return Array.from(this.reviewProcesses.values());
  }
}

export default LegalAccuracyService;
