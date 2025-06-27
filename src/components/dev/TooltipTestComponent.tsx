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

      {/* Dashboard Widget Tooltips */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Widget Tooltips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Stats Widget Tooltip */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Total Units</span>
              <Tooltip content="Total number of units in your building, including occupied and vacant properties" position="top">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2">24</div>
          </div>

          {/* Compliance Widget Tooltip */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Compliance Status</span>
              <LegalGuidanceTooltip
                title="Legal Compliance Overview"
                guidance={{
                  basic: "Your building's compliance with legal requirements including safety, financial, and governance obligations.",
                  intermediate: "Tracks compliance across multiple frameworks: LTA 1985, CLRA 2002, BSA 2022, and GDPR requirements.",
                  advanced: "Automated monitoring of statutory deadlines, consultation requirements, and regulatory obligations with risk assessment."
                }}
                framework="LTA_1985"
                mandatory={true}
              />
            </div>
            <div className="text-2xl font-bold text-green-900 mt-2">98%</div>
          </div>

          {/* Financial Widget Tooltip */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium">Annual Budget</span>
              <Tooltip content="Total annual service charge budget for building maintenance and management" position="top">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-2">£45,000</div>
          </div>
        </div>
      </Card>

      {/* Form Field Tooltips */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Field Tooltips</h2>
        <div className="space-y-4">

          {/* Text Input with Tooltip */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Building Name</label>
              <Tooltip content="The official name of your building as registered with the Land Registry" position="right">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </Tooltip>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter building name"
            />
          </div>

          {/* Select with Legal Guidance */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="text-sm font-medium text-gray-700">Consultation Type</label>
              <LegalGuidanceTooltip
                title="Section 20 Consultation Types"
                guidance={{
                  basic: "Different types of consultations are required depending on the work being carried out and its cost.",
                  intermediate: "Section 20 consultations include qualifying works, qualifying long term agreements, and public works contracts.",
                  advanced: "Each consultation type has specific notice periods, procedures, and documentation requirements under the Service Charges Regulations 2003."
                }}
                framework="LTA_1985"
                mandatory={true}
              />
            </div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Select consultation type</option>
              <option>Qualifying Works</option>
              <option>Qualifying Long Term Agreement</option>
              <option>Public Works Contract</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Settings Page Tooltips */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings & Profile Tooltips</h2>
        <div className="space-y-4">

          {/* Notification Settings */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Email Notifications</span>
              <Tooltip content="Receive important updates about your building via email, including compliance deadlines and urgent issues" position="top">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </Tooltip>
            </div>
            <div className="w-12 h-6 bg-primary-600 rounded-full"></div>
          </div>

          {/* Privacy Settings */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Data Processing Consent</span>
              <LegalGuidanceTooltip
                title="GDPR Data Processing"
                guidance={{
                  basic: "We process your personal data to provide property management services and comply with legal obligations.",
                  intermediate: "Data processing includes contact details, property information, and service charge records under legitimate interest and legal obligation lawful bases.",
                  advanced: "Full data processing details are available in our Privacy Policy, including retention periods, third-party sharing, and your rights under GDPR Articles 15-22."
                }}
                framework="GDPR"
                mandatory={true}
              />
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </Card>

      {/* Document Category Tooltips */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Category Tooltips</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Legal Documents */}
          <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-700">Legal</span>
            <LegalGuidanceTooltip
              title="Legal Documents"
              guidance={{
                basic: "Store leases, deeds, legal notices, and statutory documents required for property management.",
                intermediate: "Includes Section 20 notices, RTM claim notices, lease variations, and tribunal decisions.",
                advanced: "Maintain complete legal document trail for compliance audits and dispute resolution."
              }}
              framework="LTA_1985"
              mandatory={true}
            />
          </div>

          {/* Financial Documents */}
          <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-700">Financial</span>
            <LegalGuidanceTooltip
              title="Financial Documents"
              guidance={{
                basic: "Service charge accounts, budgets, and financial statements required by law.",
                intermediate: "Annual accounts must be provided to leaseholders within 6 months of year end.",
                advanced: "Includes certified accounts, audit reports, and Section 21 summary of rights and obligations."
              }}
              framework="LTA_1985"
              mandatory={true}
            />
          </div>

          {/* Insurance Documents */}
          <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-700">Insurance</span>
            <Tooltip content="Building insurance policies, certificates, and claims documentation" position="top">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-3 w-3" />
              </Button>
            </Tooltip>
          </div>

          {/* Maintenance Documents */}
          <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-700">Maintenance</span>
            <Tooltip content="Maintenance schedules, contractor agreements, and repair documentation" position="top">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-3 w-3" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Status Indicator */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">
            Universal tooltip visibility fixes applied - Test all scenarios above across the entire platform
          </span>
        </div>
      </Card>
    </div>
  );
};

export default TooltipTestComponent;
