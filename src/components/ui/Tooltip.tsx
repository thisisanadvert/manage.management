import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
  className?: string;
  showCloseButton?: boolean;
  glassmorphism?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  showIcon = true,
  className = '',
  showCloseButton = false,
  glassmorphism = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Check if tooltip would go off screen and adjust position
      let newPosition = position;
      
      if (position === 'top' && rect.top - tooltipRect.height < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - 10) {
        newPosition = 'top';
      } else if (position === 'left' && rect.left - tooltipRect.width < 10) {
        newPosition = 'right';
      } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth - 10) {
        newPosition = 'left';
      }
      
      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    // Enhanced base classes with glassmorphism option
    const baseClasses = glassmorphism
      ? 'absolute z-[1100] px-4 py-3 text-sm rounded-lg max-w-md tooltip-content tooltip-glassmorphism'
      : 'absolute z-[1100] px-4 py-3 text-sm rounded-lg shadow-xl max-w-md tooltip-content';

    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-3`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-3`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-3`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-3`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-3`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = glassmorphism
      ? 'absolute w-2 h-2 transform rotate-45 tooltip-arrow tooltip-glassmorphism-arrow'
      : 'absolute w-2 h-2 transform rotate-45 tooltip-arrow';

    switch (actualPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 -mr-1`;
      default:
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        showIcon && (
          <button
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            aria-label="More information"
            tabIndex={0}
          >
            <HelpCircle size={16} />
          </button>
        )
      )}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          role="tooltip"
        >
          {/* Content with optional close button */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {content}
            </div>
            {showCloseButton && (
              <button
                onClick={() => setIsVisible(false)}
                className={`ml-2 p-1 rounded-full transition-colors flex-shrink-0 ${
                  glassmorphism
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                aria-label="Close tooltip"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
