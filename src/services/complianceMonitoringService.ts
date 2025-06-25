/**
 * Compliance Monitoring Service
 * Automated monitoring and deadline tracking for legal compliance
 */

import { LegalFramework, ComplianceStatus } from '../types/legal';

export interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  framework: LegalFramework;
  category: 'filing' | 'consultation' | 'meeting' | 'inspection' | 'renewal' | 'report';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  assignedTo?: string;
  relatedEntity: string; // building ID, company ID, etc.
  actions: Array<{
    title: string;
    description: string;
    completed: boolean;
    dueDate?: Date;
  }>;
  notifications: Array<{
    type: 'email' | 'dashboard' | 'sms';
    sentAt: Date;
    recipient: string;
  }>;
}

export interface ComplianceAlert {
  id: string;
  type: 'deadline_approaching' | 'deadline_missed' | 'compliance_issue' | 'renewal_required';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  framework: LegalFramework;
  relatedDeadline?: string;
  createdAt: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

export interface MonitoringRule {
  id: string;
  name: string;
  framework: LegalFramework;
  category: string;
  condition: string; // JSON condition for evaluation
  alertThresholds: {
    warning: number; // days before deadline
    critical: number; // days before deadline
  };
  enabled: boolean;
  lastChecked?: Date;
}

class ComplianceMonitoringService {
  private static instance: ComplianceMonitoringService;
  private deadlines: Map<string, ComplianceDeadline> = new Map();
  private alerts: Map<string, ComplianceAlert> = new Map();
  private monitoringRules: Map<string, MonitoringRule> = new Map();

  private constructor() {
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  public static getInstance(): ComplianceMonitoringService {
    if (!ComplianceMonitoringService.instance) {
      ComplianceMonitoringService.instance = new ComplianceMonitoringService();
    }
    return ComplianceMonitoringService.instance;
  }

  /**
   * Initialize default monitoring rules for common compliance requirements
   */
  private initializeDefaultRules(): void {
    const defaultRules: MonitoringRule[] = [
      {
        id: 'companies-house-filing',
        name: 'Companies House Annual Filing',
        framework: 'CLRA_2002',
        category: 'filing',
        condition: JSON.stringify({
          type: 'annual_filing',
          entity_type: 'rtm_company'
        }),
        alertThresholds: {
          warning: 30,
          critical: 7
        },
        enabled: true
      },
      {
        id: 'agm-requirement',
        name: 'Annual General Meeting',
        framework: 'CLRA_2002',
        category: 'meeting',
        condition: JSON.stringify({
          type: 'agm',
          frequency: 'annual'
        }),
        alertThresholds: {
          warning: 60,
          critical: 14
        },
        enabled: true
      },
      {
        id: 'section-20-consultation',
        name: 'Section 20 Consultation Deadlines',
        framework: 'LTA_1985',
        category: 'consultation',
        condition: JSON.stringify({
          type: 'section_20',
          stage: 'any'
        }),
        alertThresholds: {
          warning: 7,
          critical: 2
        },
        enabled: true
      },
      {
        id: 'building-safety-inspection',
        name: 'Building Safety Inspections',
        framework: 'BSA_2022',
        category: 'inspection',
        condition: JSON.stringify({
          type: 'safety_inspection',
          building_type: 'high_rise'
        }),
        alertThresholds: {
          warning: 30,
          critical: 7
        },
        enabled: true
      },
      {
        id: 'insurance-renewal',
        name: 'Building Insurance Renewal',
        framework: 'LTA_1985',
        category: 'renewal',
        condition: JSON.stringify({
          type: 'insurance_renewal'
        }),
        alertThresholds: {
          warning: 60,
          critical: 14
        },
        enabled: true
      }
    ];

    defaultRules.forEach(rule => {
      this.monitoringRules.set(rule.id, rule);
    });
  }

  /**
   * Start the monitoring process
   */
  private startMonitoring(): void {
    // Check compliance every hour
    setInterval(() => {
      this.checkCompliance();
    }, 60 * 60 * 1000);

    // Initial check
    this.checkCompliance();
  }

  /**
   * Check all compliance requirements and generate alerts
   */
  private async checkCompliance(): Promise<void> {
    const now = new Date();

    // Check all deadlines
    for (const [id, deadline] of this.deadlines) {
      const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update deadline status
      if (daysUntilDue < 0) {
        deadline.status = 'overdue';
      } else if (daysUntilDue <= 7) {
        deadline.status = 'due_soon';
      } else {
        deadline.status = 'upcoming';
      }

      // Check if alerts need to be generated
      const rule = this.getApplicableRule(deadline);
      if (rule) {
        this.checkDeadlineAlerts(deadline, rule, daysUntilDue);
      }
    }

    // Update monitoring rules last checked time
    this.monitoringRules.forEach(rule => {
      rule.lastChecked = now;
    });
  }

  /**
   * Get applicable monitoring rule for a deadline
   */
  private getApplicableRule(deadline: ComplianceDeadline): MonitoringRule | undefined {
    for (const [id, rule] of this.monitoringRules) {
      if (rule.framework === deadline.framework && 
          rule.category === deadline.category && 
          rule.enabled) {
        return rule;
      }
    }
    return undefined;
  }

  /**
   * Check if alerts need to be generated for a deadline
   */
  private checkDeadlineAlerts(deadline: ComplianceDeadline, rule: MonitoringRule, daysUntilDue: number): void {
    const alertId = `${deadline.id}_${Date.now()}`;

    if (daysUntilDue < 0) {
      // Overdue alert
      this.createAlert({
        id: alertId,
        type: 'deadline_missed',
        severity: 'critical',
        title: `Overdue: ${deadline.title}`,
        message: `${deadline.title} was due on ${deadline.dueDate.toLocaleDateString('en-GB')}. Immediate action required.`,
        framework: deadline.framework,
        relatedDeadline: deadline.id,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: true
      });
    } else if (daysUntilDue <= rule.alertThresholds.critical) {
      // Critical alert
      this.createAlert({
        id: alertId,
        type: 'deadline_approaching',
        severity: 'critical',
        title: `Critical: ${deadline.title}`,
        message: `${deadline.title} is due in ${daysUntilDue} day(s). Urgent action required.`,
        framework: deadline.framework,
        relatedDeadline: deadline.id,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: true
      });
    } else if (daysUntilDue <= rule.alertThresholds.warning) {
      // Warning alert
      this.createAlert({
        id: alertId,
        type: 'deadline_approaching',
        severity: 'warning',
        title: `Upcoming: ${deadline.title}`,
        message: `${deadline.title} is due in ${daysUntilDue} day(s). Please prepare required actions.`,
        framework: deadline.framework,
        relatedDeadline: deadline.id,
        createdAt: new Date(),
        acknowledged: false,
        actionRequired: false
      });
    }
  }

  /**
   * Create a new compliance alert
   */
  private createAlert(alert: ComplianceAlert): void {
    // Check if similar alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(a => 
      a.relatedDeadline === alert.relatedDeadline && 
      a.type === alert.type &&
      !a.acknowledged
    );

    if (!existingAlert) {
      this.alerts.set(alert.id, alert);
      this.sendNotification(alert);
    }
  }

  /**
   * Send notification for an alert
   */
  private async sendNotification(alert: ComplianceAlert): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`Compliance Alert: ${alert.title} - ${alert.message}`);
  }

  /**
   * Add a new compliance deadline
   */
  public addDeadline(deadline: ComplianceDeadline): void {
    this.deadlines.set(deadline.id, deadline);
  }

  /**
   * Update an existing deadline
   */
  public updateDeadline(id: string, updates: Partial<ComplianceDeadline>): void {
    const existing = this.deadlines.get(id);
    if (existing) {
      this.deadlines.set(id, { ...existing, ...updates });
    }
  }

  /**
   * Mark deadline as completed
   */
  public completeDeadline(id: string): void {
    this.updateDeadline(id, { status: 'completed' });
  }

  /**
   * Get all deadlines
   */
  public getDeadlines(): ComplianceDeadline[] {
    return Array.from(this.deadlines.values());
  }

  /**
   * Get deadlines by status
   */
  public getDeadlinesByStatus(status: ComplianceDeadline['status']): ComplianceDeadline[] {
    return this.getDeadlines().filter(d => d.status === status);
  }

  /**
   * Get all alerts
   */
  public getAlerts(): ComplianceAlert[] {
    return Array.from(this.alerts.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get unacknowledged alerts
   */
  public getUnacknowledgedAlerts(): ComplianceAlert[] {
    return this.getAlerts().filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(id, alert);
    }
  }

  /**
   * Get compliance summary
   */
  public getComplianceSummary(): {
    totalDeadlines: number;
    upcomingDeadlines: number;
    overdueDeadlines: number;
    criticalAlerts: number;
    warningAlerts: number;
  } {
    const deadlines = this.getDeadlines();
    const alerts = this.getUnacknowledgedAlerts();

    return {
      totalDeadlines: deadlines.length,
      upcomingDeadlines: deadlines.filter(d => d.status === 'due_soon').length,
      overdueDeadlines: deadlines.filter(d => d.status === 'overdue').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: alerts.filter(a => a.severity === 'warning').length
    };
  }
}

export default ComplianceMonitoringService;
