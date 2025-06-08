import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  openIssues: number;
  urgentIssues: number;
  totalBudget: number;
  spentThisYear: number;
  upcomingPayments: number;
  complianceItems: number;
  overdueCompliance: number;
}

export interface RecentActivity {
  id: string;
  type: 'issue' | 'announcement' | 'payment' | 'compliance';
  title: string;
  description: string;
  date: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'important' | 'reminder';
  dueDate?: Date;
  route?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  actionItems: ActionItem[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalUnits: 0,
      occupiedUnits: 0,
      openIssues: 0,
      urgentIssues: 0,
      totalBudget: 0,
      spentThisYear: 0,
      upcomingPayments: 0,
      complianceItems: 0,
      overdueCompliance: 0,
    },
    recentActivity: [],
    actionItems: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.metadata?.buildingId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const buildingId = user.metadata.buildingId;

        // Fetch building stats
        const [
          buildingResult,
          unitsResult,
          issuesResult,
          financialResult,
          complianceResult,
          announcementsResult
        ] = await Promise.all([
          // Building info
          supabase
            .from('buildings')
            .select('*')
            .eq('id', buildingId)
            .single(),
          
          // Units count
          supabase
            .from('units')
            .select('id')
            .eq('building_id', buildingId),
          
          // Issues
          supabase
            .from('issues')
            .select('*')
            .eq('building_id', buildingId)
            .order('created_at', { ascending: false }),
          
          // Financial data
          supabase
            .from('financial_setup')
            .select('*')
            .eq('building_id', buildingId)
            .single(),
          
          // Compliance requirements
          supabase
            .from('compliance_requirements')
            .select('*')
            .eq('building_id', buildingId),
          
          // Recent announcements
          supabase
            .from('announcements')
            .select('*')
            .eq('building_id', buildingId)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // Process stats
        const building = buildingResult.data;
        const units = unitsResult.data || [];
        const issues = issuesResult.data || [];
        const financial = financialResult.data;
        const compliance = complianceResult.data || [];
        const announcements = announcementsResult.data || [];

        const openIssues = issues.filter(issue => issue.status !== 'resolved').length;
        const urgentIssues = issues.filter(issue => 
          issue.priority === 'urgent' && issue.status !== 'resolved'
        ).length;

        const overdueCompliance = compliance.filter(req => 
          new Date(req.next_due) < new Date()
        ).length;

        // Create recent activity
        const recentActivity: RecentActivity[] = [
          ...issues.slice(0, 3).map(issue => ({
            id: issue.id,
            type: 'issue' as const,
            title: issue.title,
            description: issue.description,
            date: new Date(issue.created_at),
            priority: issue.priority,
            status: issue.status,
          })),
          ...announcements.slice(0, 2).map(announcement => ({
            id: announcement.id,
            type: 'announcement' as const,
            title: announcement.title,
            description: announcement.content,
            date: new Date(announcement.created_at),
          }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

        // Create action items
        const actionItems: ActionItem[] = [];
        
        if (urgentIssues > 0) {
          actionItems.push({
            id: 'urgent-issues',
            title: `${urgentIssues} Urgent Issue${urgentIssues > 1 ? 's' : ''}`,
            description: 'Require immediate attention',
            type: 'urgent',
            route: `/${user.role?.split('-')[0]}/issues`,
          });
        }

        if (overdueCompliance > 0) {
          actionItems.push({
            id: 'overdue-compliance',
            title: `${overdueCompliance} Overdue Compliance Item${overdueCompliance > 1 ? 's' : ''}`,
            description: 'Legal requirements past due date',
            type: 'urgent',
          });
        }

        if (!financial) {
          actionItems.push({
            id: 'financial-setup',
            title: 'Complete Financial Setup',
            description: 'Set up budgets and service charges',
            type: 'important',
            route: `/${user.role?.split('-')[0]}/finances`,
          });
        }

        setData({
          stats: {
            totalUnits: building?.total_units || 0,
            occupiedUnits: units.length,
            openIssues,
            urgentIssues,
            totalBudget: financial?.total_annual_budget || 0,
            spentThisYear: 0, // TODO: Calculate from transactions
            upcomingPayments: 0, // TODO: Calculate upcoming service charges
            complianceItems: compliance.length,
            overdueCompliance,
          },
          recentActivity,
          actionItems,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data',
        }));
      }
    };

    fetchDashboardData();
  }, [user?.metadata?.buildingId, user?.role]);

  return data;
};
