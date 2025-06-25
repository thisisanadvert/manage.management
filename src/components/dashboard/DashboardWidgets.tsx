import React from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  FileText,
  Bell,
  Scale
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { DashboardStats, RecentActivity, ActionItem } from '../../hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role?.split('-')[0];

  const statCards = [
    {
      title: 'Total Units',
      value: stats.totalUnits,
      subtitle: `${stats.occupiedUnits} occupied`,
      icon: Building2,
      color: 'primary',
      onClick: () => navigate(`/${basePath}/building-setup`),
    },
    {
      title: 'Open Issues',
      value: stats.openIssues,
      subtitle: `${stats.urgentIssues} urgent`,
      icon: AlertTriangle,
      color: stats.urgentIssues > 0 ? 'warning' : 'success',
      onClick: () => navigate(`/${basePath}/issues`),
    },
    {
      title: 'Annual Budget',
      value: `£${stats.totalBudget.toLocaleString()}`,
      subtitle: `£${stats.spentThisYear.toLocaleString()} spent`,
      icon: Wallet,
      color: 'primary',
      onClick: () => navigate(`/${basePath}/finances`),
    },
    {
      title: 'Compliance',
      value: stats.complianceItems,
      subtitle: `${stats.overdueCompliance} overdue`,
      icon: CheckCircle2,
      color: stats.overdueCompliance > 0 ? 'danger' : 'success',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card 
          key={index} 
          className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
            card.onClick ? 'hover:bg-gray-50' : ''
          }`}
          onClick={card.onClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              card.color === 'primary' ? 'bg-blue-100' :
              card.color === 'warning' ? 'bg-yellow-100' :
              card.color === 'danger' ? 'bg-red-100' :
              card.color === 'success' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <card.icon className={`h-6 w-6 ${
                card.color === 'primary' ? 'text-blue-600' :
                card.color === 'warning' ? 'text-yellow-600' :
                card.color === 'danger' ? 'text-red-600' :
                card.color === 'success' ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

interface ActionItemsProps {
  actionItems: ActionItem[];
}

export const ActionItems: React.FC<ActionItemsProps> = ({ actionItems }) => {
  const navigate = useNavigate();

  if (actionItems.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Action Items</h2>
        </div>
        <div className="text-center py-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            No urgent action items at the moment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Action Items</h2>
        <Badge variant={actionItems.some(item => item.type === 'urgent') ? 'danger' : 'warning'}>
          {actionItems.length} item{actionItems.length > 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="space-y-3">
        {actionItems.map((item) => (
          <div 
            key={item.id}
            className={`p-3 rounded-lg border-l-4 ${
              item.type === 'urgent' 
                ? 'border-red-500 bg-red-50' 
                : item.type === 'important'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.dueDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {item.dueDate.toLocaleDateString()}
                  </p>
                )}
              </div>
              {item.route && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.route!)}
                  rightIcon={<ArrowRight size={14} />}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface RecentActivityProps {
  activities: RecentActivity[];
}

export const RecentActivityWidget: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role?.split('-')[0];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue': return AlertTriangle;
      case 'announcement': return Bell;
      case 'payment': return Wallet;
      case 'compliance': return FileText;
      default: return Clock;
    }
  };

  const getActivityColor = (activity: RecentActivity) => {
    if (activity.type === 'issue') {
      switch (activity.priority) {
        case 'urgent': return 'text-red-600';
        case 'high': return 'text-orange-600';
        case 'medium': return 'text-yellow-600';
        default: return 'text-blue-600';
      }
    }
    return 'text-blue-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/${basePath}/issues`)}
        >
          View All
        </Button>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-4">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No recent activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Activity will appear here as things happen in your building.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${getActivityColor(activity)}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {activity.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  {activity.status && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      {activity.status}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const basePath = userRole.split('-')[0];

  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Report Issue',
        description: 'Report a maintenance or building issue',
        icon: AlertTriangle,
        color: 'warning',
        onClick: () => navigate(`/${basePath}/issues`),
      },
      {
        title: 'View Finances',
        description: 'Check budgets and expenses',
        icon: Wallet,
        color: 'primary',
        onClick: () => navigate(`/${basePath}/finances`),
      },
      {
        title: 'Documents',
        description: 'Access building documents',
        icon: FileText,
        color: 'primary',
        onClick: () => navigate(`/${basePath}/documents`),
      },
    ];

    if (userRole.includes('director')) {
      baseActions.push({
        title: 'Schedule Meeting',
        description: 'Plan AGM or building meeting',
        icon: Calendar,
        color: 'primary',
        onClick: () => navigate(`/${basePath}/agms`),
      });
    }

    // Add RTM tools only for RTM directors (RMC directors already own the freehold)
    if (userRole === 'rtm-director') {
      baseActions.push({
        title: 'RTM Formation',
        description: 'Access RTM formation tools',
        icon: Scale,
        color: 'success',
        onClick: () => navigate(`/${basePath}/rtm`),
      });
    }

    // Add Share Certificates for RMC directors
    if (userRole === 'rmc-director') {
      baseActions.push({
        title: 'Share Certificates',
        description: 'Manage share certificates',
        icon: Scale,
        color: 'primary',
        onClick: () => navigate(`/${basePath}/shares`),
      });
    }

    return baseActions;
  };

  const actions = getQuickActions();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-3 text-left rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className={`p-2 rounded-lg w-fit mb-2 ${
              action.color === 'primary' ? 'bg-blue-100' :
              action.color === 'warning' ? 'bg-yellow-100' :
              action.color === 'success' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <action.icon className={`h-5 w-5 ${
                action.color === 'primary' ? 'text-blue-600' :
                action.color === 'warning' ? 'text-yellow-600' :
                action.color === 'success' ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
            <p className="text-xs text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};
