import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Clock } from 'lucide-react';
import { ComplianceStatus } from '../../types/legal';

interface ComplianceStatusIndicatorProps {
  status: ComplianceStatus;
  title?: string;
  description?: string;
  lastReviewed?: Date;
  nextDue?: Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const ComplianceStatusIndicator: React.FC<ComplianceStatusIndicatorProps> = ({
  status,
  title,
  description,
  lastReviewed,
  nextDue,
  size = 'md',
  showText = true,
  className = ''
}) => {
  const getStatusConfig = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'Compliant',
          description: 'All requirements are met'
        };
      case 'at_risk':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          text: 'At Risk',
          description: 'Action may be required soon'
        };
      case 'non_compliant':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Non-Compliant',
          description: 'Immediate action required'
        };
      case 'pending_review':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Pending Review',
          description: 'Review in progress'
        };
      case 'unknown':
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: 'Unknown',
          description: 'Status needs to be determined'
        };
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          icon: 'h-4 w-4',
          text: 'text-xs',
          title: 'text-sm font-medium',
          description: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-4',
          icon: 'h-6 w-6',
          text: 'text-base',
          title: 'text-lg font-semibold',
          description: 'text-sm'
        };
      case 'md':
      default:
        return {
          container: 'p-3',
          icon: 'h-5 w-5',
          text: 'text-sm',
          title: 'text-base font-medium',
          description: 'text-sm'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!showText) {
    // Icon-only mode
    return (
      <div className={`inline-flex items-center justify-center rounded-full ${config.bgColor} ${sizeClasses.container} ${className}`}>
        <Icon className={`${config.color} ${sizeClasses.icon}`} />
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} ${sizeClasses.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.color}`}>
          <Icon className={sizeClasses.icon} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`${config.color} ${sizeClasses.title} truncate`}>
              {title}
            </h3>
          )}
          
          <div className="flex items-center space-x-2 mt-1">
            <span className={`${config.color} ${sizeClasses.text} font-medium`}>
              {config.text}
            </span>
            {nextDue && (
              <span className={`text-gray-500 ${sizeClasses.description}`}>
                •
              </span>
            )}
            {nextDue && (
              <span className={`text-gray-500 ${sizeClasses.description}`}>
                {(() => {
                  const daysUntil = getDaysUntilDue(nextDue);
                  if (daysUntil < 0) {
                    return `Overdue by ${Math.abs(daysUntil)} days`;
                  } else if (daysUntil === 0) {
                    return 'Due today';
                  } else if (daysUntil === 1) {
                    return 'Due tomorrow';
                  } else {
                    return `Due in ${daysUntil} days`;
                  }
                })()}
              </span>
            )}
          </div>
          
          {description && (
            <p className={`text-gray-600 ${sizeClasses.description} mt-1`}>
              {description}
            </p>
          )}
          
          {lastReviewed && (
            <p className={`text-gray-500 ${sizeClasses.description} mt-2`}>
              Last reviewed: {formatDate(lastReviewed)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatusIndicator;
