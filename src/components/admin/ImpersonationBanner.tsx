import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, Clock, LogOut, Shield, Eye } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

interface ImpersonationBannerProps {
  className?: string;
}

const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ className = '' }) => {
  const { 
    isImpersonating, 
    impersonationState, 
    endImpersonation, 
    getEffectiveUser, 
    getOriginalUser 
  } = useAuth();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const effectiveUser = getEffectiveUser();
  const originalUser = getOriginalUser();

  // Update time remaining every minute
  useEffect(() => {
    if (!isImpersonating || !impersonationState.startTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const elapsed = (now.getTime() - impersonationState.startTime!.getTime()) / (1000 * 60);
      const remaining = Math.max(0, impersonationState.maxDuration - elapsed);
      
      setTimeRemaining(remaining);
      
      // Show warning when less than 15 minutes remaining
      if (remaining <= 15 && remaining > 0) {
        setShowWarning(true);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isImpersonating, impersonationState.startTime, impersonationState.maxDuration]);

  const handleEndImpersonation = async () => {
    setIsEnding(true);
    try {
      await endImpersonation('manual');
    } catch (error) {
      console.error('Error ending impersonation:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getUrgencyColor = (minutes: number): string => {
    if (minutes <= 5) return 'bg-red-600';
    if (minutes <= 15) return 'bg-orange-600';
    return 'bg-red-500';
  };

  if (!isImpersonating || !effectiveUser || !originalUser) {
    return null;
  }

  return (
    <div className={`${getUrgencyColor(timeRemaining)} text-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left side - Impersonation info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold text-sm">IMPERSONATING</span>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {effectiveUser.metadata?.firstName && effectiveUser.metadata?.lastName
                    ? `${effectiveUser.metadata.firstName} ${effectiveUser.metadata.lastName}`
                    : effectiveUser.email
                  }
                </span>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30">
                {effectiveUser.role}
              </Badge>
              
              {effectiveUser.metadata?.buildingName && (
                <span className="hidden md:inline text-sm opacity-90">
                  @ {effectiveUser.metadata.buildingName}
                </span>
              )}
            </div>
          </div>

          {/* Center - Session info */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">
                Reason: {impersonationState.reason}
              </span>
            </div>
            
            <div className="w-px h-6 bg-white/30" />
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatTimeRemaining(timeRemaining)} remaining
              </span>
            </div>
            
            {showWarning && (
              <>
                <div className="w-px h-6 bg-white/30" />
                <div className="flex items-center space-x-2 animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Session expiring soon!
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile time display */}
            <div className="lg:hidden flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={handleEndImpersonation}
              isLoading={isEnding}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
            >
              Exit Impersonation
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile session info */}
      <div className="lg:hidden border-t border-white/20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <span>Reason: {impersonationState.reason}</span>
            {showWarning && (
              <div className="flex items-center space-x-1 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span>Expiring soon!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
