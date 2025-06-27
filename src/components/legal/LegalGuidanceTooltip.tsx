import React, { useState } from 'react';
import { HelpCircle, ExternalLink, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LegalFramework, ComplianceLevel, LEGAL_FRAMEWORK_INFO } from '../../types/legal';

interface LegalGuidanceTooltipProps {
  title: string;
  guidance: {
    basic: string;
    intermediate: string;
    advanced: string;
  };
  framework: LegalFramework;
  complianceLevel?: ComplianceLevel;
  mandatory?: boolean;
  externalResources?: Array<{
    title: string;
    url: string;
    type: string;
    description: string;
  }>;
  className?: string;
}

const LegalGuidanceTooltip: React.FC<LegalGuidanceTooltipProps> = ({
  title,
  guidance,
  framework,
  complianceLevel = 'basic',
  mandatory = false,
  externalResources = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ComplianceLevel>(complianceLevel);

  const frameworkInfo = LEGAL_FRAMEWORK_INFO[framework];

  const getLevelIcon = (level: ComplianceLevel) => {
    switch (level) {
      case 'basic':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'intermediate':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'advanced':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getLevelColor = (level: ComplianceLevel) => {
    switch (level) {
      case 'basic':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'intermediate':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'advanced':
        return 'border-orange-200 bg-orange-50 text-orange-800';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1 p-1 rounded-full transition-colors ${
          mandatory 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        aria-label={`Legal guidance for ${title}`}
      >
        <HelpCircle className="h-4 w-4" />
        {mandatory && (
          <span className="text-xs font-medium text-red-600">*</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 z-[1000] w-96 max-w-screen-sm">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 legal-guidance-tooltip">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {title}
                    {mandatory && (
                      <span className="ml-1 text-red-600 text-xs">*Required</span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs text-gray-500">
                      {frameworkInfo.title}
                    </span>
                    <a
                      href={frameworkInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Level Selector */}
              <div className="flex space-x-1 mb-3">
                {(['basic', 'intermediate', 'advanced'] as ComplianceLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      selectedLevel === level
                        ? getLevelColor(level)
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {getLevelIcon(level)}
                    <span className="capitalize">{level}</span>
                  </button>
                ))}
              </div>

              {/* Guidance Content */}
              <div className="mb-4">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {guidance[selectedLevel]}
                </div>
              </div>

              {/* External Resources */}
              {externalResources.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-medium text-gray-900 mb-2">
                    Additional Resources
                  </h4>
                  <div className="space-y-2">
                    {externalResources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start space-x-2 text-xs text-blue-600 hover:text-blue-800 group"
                      >
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium group-hover:underline">
                            {resource.title}
                          </div>
                          <div className="text-gray-500">
                            {resource.description}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Framework Description */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="text-xs text-gray-500">
                  {frameworkInfo.description}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LegalGuidanceTooltip;
