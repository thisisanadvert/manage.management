/**
 * Tooltip Test Component
 * Used to verify tooltip visibility fixes across different scenarios
 */

import React, { useState } from 'react';
import { HelpCircle, TestTube, Eye, Palette } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import Button from '../ui/Button';
import Card from '../ui/Card';

const TooltipTestComponent: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  return (
    <div className={`space-y-8 p-6 ${highContrast ? 'high-contrast' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TestTube className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tooltip Visibility Test</h1>
            <p className="text-gray-600 mt-1">
              Test tooltips across different scenarios and accessibility modes
            </p>
          </div>
        </div>
        <Button
          onClick={toggleHighContrast}
          leftIcon={<Palette className="h-4 w-4" />}
          variant={highContrast ? 'primary' : 'outline'}
        >
          {highContrast ? 'Disable' : 'Enable'} High Contrast
        </Button>
      </div>

      {/* Basic Tooltip Tests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Tooltip Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Top Position */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top Position</h3>
            <Tooltip content="This tooltip appears above the trigger element" position="top">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Bottom Position */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Bottom Position</h3>
            <Tooltip content="This tooltip appears below the trigger element" position="bottom">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Left Position */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Left Position</h3>
            <Tooltip content="This tooltip appears to the left of the trigger element" position="left">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Right Position */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Right Position</h3>
            <Tooltip content="This tooltip appears to the right of the trigger element" position="right">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Long Content Tooltip Test */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Long Content Tooltip</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Hover for detailed information:</span>
          <Tooltip 
            content="This is a much longer tooltip content that tests how the tooltip handles multiple lines of text and ensures proper wrapping and readability across different screen sizes and accessibility modes."
            position="top"
          >
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Legal Guidance Tooltip Tests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Guidance Tooltip Tests</h2>
        <div className="space-y-4">
          
          {/* Basic Legal Tooltip */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Section 20 Consultation Requirements:</span>
            <LegalGuidanceTooltip
              title="Section 20 Consultation"
              guidance={{
                basic: "You must consult leaseholders before carrying out major works costing more than £250 per leaseholder.",
                intermediate: "The consultation process involves specific notice periods and procedures under the Service Charges (Consultation Requirements) Regulations 2003.",
                advanced: "Failure to follow proper consultation procedures can result in service charge limitations and potential legal challenges from leaseholders."
              }}
              framework="LTA_1985"
              mandatory={true}
              externalResources={[
                {
                  title: "LEASE Guidance on Section 20",
                  url: "https://www.lease-advice.org/advice-guide/service-charges-consultation/",
                  type: "guidance",
                  description: "Comprehensive guide to Section 20 consultation requirements"
                }
              ]}
            />
          </div>

          {/* RTM Legal Tooltip */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">RTM Eligibility Requirements:</span>
            <LegalGuidanceTooltip
              title="RTM Eligibility"
              guidance={{
                basic: "Your building must meet specific criteria to qualify for Right to Manage under the Commonhold and Leasehold Reform Act 2002.",
                intermediate: "Key requirements include building structure, lease terms, and leaseholder participation thresholds.",
                advanced: "Detailed eligibility assessment involves complex legal criteria including qualifying tenants, premises requirements, and procedural compliance."
              }}
              framework="CLRA_2002"
              mandatory={false}
            />
          </div>

          {/* Mandatory Legal Tooltip (Red Circle with Asterisk) */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Mandatory Legal Requirement:</span>
            <LegalGuidanceTooltip
              title="Section 20 Consultation (Mandatory)"
              guidance={{
                basic: "This is a mandatory legal requirement. You MUST consult leaseholders before carrying out major works costing more than £250 per leaseholder.",
                intermediate: "Failure to follow Section 20 consultation procedures can result in service charge limitations and legal challenges.",
                advanced: "The consultation process is governed by strict statutory timelines under LTA 1985 and Service Charges Regulations 2003."
              }}
              framework="LTA_1985"
              mandatory={true}
              externalResources={[
                {
                  title: "LEASE Section 20 Guide",
                  url: "https://www.lease-advice.org/advice-guide/service-charges-consultation/",
                  type: "guidance",
                  description: "Official guidance on Section 20 consultation requirements"
                }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Edge Case Tests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edge Case Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Near Screen Edge */}
          <div className="text-right">
            <span className="text-gray-700 mr-2">Near right edge:</span>
            <Tooltip content="This tooltip should reposition itself to stay visible" position="right">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Multiple Tooltips */}
          <div className="text-center">
            <span className="text-gray-700 mr-2">Multiple tooltips:</span>
            <Tooltip content="First tooltip" position="top">
              <Button variant="outline" size="sm" className="mr-2">
                1
              </Button>
            </Tooltip>
            <Tooltip content="Second tooltip" position="bottom">
              <Button variant="outline" size="sm">
                2
              </Button>
            </Tooltip>
          </div>

          {/* Nested Content */}
          <div className="text-left">
            <span className="text-gray-700 mr-2">In nested content:</span>
            <div className="bg-gray-100 p-2 rounded">
              <Tooltip content="Tooltip in nested container" position="top">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Indicator */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">
            Tooltip visibility fixes applied - Test all scenarios above
          </span>
        </div>
      </Card>
    </div>
  );
};

export default TooltipTestComponent;
