import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl' }
  };

  const variantClasses = {
    default: {
      text: 'text-primary-800',
      bgGradient: 'from-blue-400 to-primary-600',
      innerBg: 'from-white to-gray-50',
      windows: '#2563EB'
    },
    white: {
      text: 'text-white',
      bgGradient: 'from-white/20 to-white/10',
      innerBg: 'from-white/90 to-white/70',
      windows: '#ffffff'
    },
    dark: {
      text: 'text-gray-900',
      bgGradient: 'from-gray-700 to-gray-900',
      innerBg: 'from-white to-gray-100',
      windows: '#374151'
    }
  };

  const { icon: iconSize, text: textSize } = sizeClasses[size];
  const colors = variantClasses[variant];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* 3D Building Icon */}
      <div className={`${iconSize} relative`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`bgGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F8EF7" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id={`innerGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <filter id={`shadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1"/>
            </filter>
          </defs>
          
          {/* Main container with gradient */}
          <rect
            width="32"
            height="32"
            rx="7"
            fill={`url(#bgGradient-${variant})`}
            filter={`url(#shadow-${variant})`}
          />
          <rect 
            x="1" 
            y="1" 
            width="30" 
            height="30" 
            rx="6" 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="0.5"
          />
          
          {/* Inner building grid */}
          <rect
            x="7"
            y="7"
            width="18"
            height="18"
            rx="3"
            fill={`url(#innerGradient-${variant})`}
            filter={`url(#shadow-${variant})`}
          />
          <rect 
            x="7.5" 
            y="7.5" 
            width="17" 
            height="17" 
            rx="2.5" 
            fill="none" 
            stroke="rgba(37,99,235,0.1)" 
            strokeWidth="0.5"
          />
          
          {/* Building windows/units in 3x3 grid */}
          <g fill={colors.windows} opacity="0.8">
            {/* Top row */}
            <rect x="10" y="10" width="3" height="3" rx="0.5"/>
            <rect x="14.5" y="10" width="3" height="3" rx="0.5"/>
            <rect x="19" y="10" width="3" height="3" rx="0.5"/>
            
            {/* Middle row */}
            <rect x="10" y="14.5" width="3" height="3" rx="0.5"/>
            <rect x="14.5" y="14.5" width="3" height="3" rx="0.5"/>
            <rect x="19" y="14.5" width="3" height="3" rx="0.5"/>
            
            {/* Bottom row */}
            <rect x="10" y="19" width="3" height="3" rx="0.5"/>
            <rect x="14.5" y="19" width="3" height="3" rx="0.5"/>
            <rect x="19" y="19" width="3" height="3" rx="0.5"/>
          </g>
          
          {/* Subtle highlight for 3D effect */}
          <rect 
            x="7" 
            y="7" 
            width="18" 
            height="2" 
            rx="3" 
            fill="rgba(255,255,255,0.3)"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`${textSize} font-bold ${colors.text} pixel-font`}>
          Manage.Management
        </span>
      )}
    </div>
  );
};

export default Logo;
