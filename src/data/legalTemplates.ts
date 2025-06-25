/**
 * Legal Template Library
 * Comprehensive collection of UK property law compliant templates
 */

import { LegalTemplate } from '../types/legal';

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: 'section-20-notice-intention',
    title: 'Section 20 Notice of Intention',
    description: 'First stage consultation notice for major works under Section 20 LTA 1985',
    category: 'section_20_consultation',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `NOTICE OF INTENTION TO CARRY OUT WORKS

To: All Leaseholders of {{buildingName}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTION 20
SERVICE CHARGES (CONSULTATION REQUIREMENTS) (ENGLAND) REGULATIONS 2003

We are required under Section 20 of the Landlord and Tenant Act 1985 to consult you about proposed works to {{buildingName}}, {{buildingAddress}}.

DESCRIPTION OF PROPOSED WORKS:
{{worksDescription}}

ESTIMATED TOTAL COST: £{{estimatedCost}}
ESTIMATED COST PER LEASEHOLDER: £{{costPerLeaseholder}}

REASONS FOR THE WORKS:
{{reasonsForWorks}}

You have the right to make written observations about the proposed works. Any observations must be sent to us within 30 days of the date of this notice.

Please send your observations to:
{{contactName}}
{{contactAddress}}
Email: {{contactEmail}}
Telephone: {{contactPhone}}

We will consider all observations received before proceeding to the next stage of consultation.

You also have the right to propose the name of a person from whom we should try to obtain an estimate for the works. Any such proposal must be made within 30 days of the date of this notice.

IMPORTANT: If you do not respond to this notice, we may proceed with the consultation process. However, your right to challenge service charges is not affected by your failure to respond.

For independent advice about your rights and obligations as a leaseholder, you may wish to contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org or 0207 832 2500
- Citizens Advice: www.citizensadvice.org.uk

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Full name of the building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Complete building address'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of the person sending the notice'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position (e.g., RTM Director, Managing Agent)'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company or management company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of the notice'
      },
      {
        name: 'worksDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of the proposed works'
      },
      {
        name: 'estimatedCost',
        type: 'currency',
        required: true,
        description: 'Total estimated cost of works'
      },
      {
        name: 'costPerLeaseholder',
        type: 'currency',
        required: true,
        description: 'Estimated cost per leaseholder'
      },
      {
        name: 'reasonsForWorks',
        type: 'text',
        required: true,
        description: 'Explanation of why the works are necessary'
      },
      {
        name: 'contactName',
        type: 'text',
        required: true,
        description: 'Contact person for observations'
      },
      {
        name: 'contactAddress',
        type: 'address',
        required: true,
        description: 'Contact address for observations'
      },
      {
        name: 'contactEmail',
        type: 'text',
        required: true,
        description: 'Contact email address'
      },
      {
        name: 'contactPhone',
        type: 'text',
        required: true,
        description: 'Contact telephone number'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.1'
  },

  {
    id: 'section-20-notice-proposal',
    title: 'Section 20 Notice of Proposal',
    description: 'Second stage consultation notice with estimates for major works',
    category: 'section_20_consultation',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `NOTICE OF PROPOSAL

To: All Leaseholders of {{buildingName}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTION 20
SERVICE CHARGES (CONSULTATION REQUIREMENTS) (ENGLAND) REGULATIONS 2003

Further to our Notice of Intention dated {{noticeIntentionDate}}, we now provide you with details of our proposals for the works to {{buildingName}}, {{buildingAddress}}.

DESCRIPTION OF PROPOSED WORKS:
{{worksDescription}}

ESTIMATES RECEIVED:

Contractor 1: {{contractor1Name}}
Address: {{contractor1Address}}
Estimate: £{{contractor1Estimate}}
{{contractor1Details}}

Contractor 2: {{contractor2Name}}
Address: {{contractor2Address}}
Estimate: £{{contractor2Estimate}}
{{contractor2Details}}

{{additionalContractors}}

PREFERRED CONTRACTOR:
We propose to appoint {{preferredContractor}} at a cost of £{{preferredEstimate}}.

REASONS FOR PREFERENCE:
{{reasonsForPreference}}

ESTIMATED COST PER LEASEHOLDER: £{{costPerLeaseholder}}

OBSERVATIONS RECEIVED:
{{observationsSummary}}

You have the right to make written observations about our proposals. Any observations must be sent to us within 30 days of the date of this notice.

Please send your observations to:
{{contactName}}
{{contactAddress}}
Email: {{contactEmail}}
Telephone: {{contactPhone}}

IMPORTANT: If you wish to inspect the estimates, please contact us to arrange an appointment. Copies of estimates are available for inspection at {{inspectionAddress}} during normal business hours.

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Full name of the building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Complete building address'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of the person sending the notice'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company or management company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of this notice'
      },
      {
        name: 'noticeIntentionDate',
        type: 'date',
        required: true,
        description: 'Date of the original Notice of Intention'
      },
      {
        name: 'worksDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of the proposed works'
      },
      {
        name: 'contractor1Name',
        type: 'text',
        required: true,
        description: 'Name of first contractor'
      },
      {
        name: 'contractor1Address',
        type: 'address',
        required: true,
        description: 'Address of first contractor'
      },
      {
        name: 'contractor1Estimate',
        type: 'currency',
        required: true,
        description: 'First contractor estimate'
      },
      {
        name: 'contractor1Details',
        type: 'text',
        required: false,
        description: 'Additional details about first contractor'
      },
      {
        name: 'contractor2Name',
        type: 'text',
        required: true,
        description: 'Name of second contractor'
      },
      {
        name: 'contractor2Address',
        type: 'address',
        required: true,
        description: 'Address of second contractor'
      },
      {
        name: 'contractor2Estimate',
        type: 'currency',
        required: true,
        description: 'Second contractor estimate'
      },
      {
        name: 'contractor2Details',
        type: 'text',
        required: false,
        description: 'Additional details about second contractor'
      },
      {
        name: 'additionalContractors',
        type: 'text',
        required: false,
        description: 'Details of any additional contractors'
      },
      {
        name: 'preferredContractor',
        type: 'text',
        required: true,
        description: 'Name of preferred contractor'
      },
      {
        name: 'preferredEstimate',
        type: 'currency',
        required: true,
        description: 'Preferred contractor estimate'
      },
      {
        name: 'reasonsForPreference',
        type: 'text',
        required: true,
        description: 'Reasons for choosing preferred contractor'
      },
      {
        name: 'costPerLeaseholder',
        type: 'currency',
        required: true,
        description: 'Estimated cost per leaseholder'
      },
      {
        name: 'observationsSummary',
        type: 'text',
        required: false,
        description: 'Summary of observations received from Notice of Intention'
      },
      {
        name: 'contactName',
        type: 'text',
        required: true,
        description: 'Contact person for observations'
      },
      {
        name: 'contactAddress',
        type: 'address',
        required: true,
        description: 'Contact address'
      },
      {
        name: 'contactEmail',
        type: 'text',
        required: true,
        description: 'Contact email address'
      },
      {
        name: 'contactPhone',
        type: 'text',
        required: true,
        description: 'Contact telephone number'
      },
      {
        name: 'inspectionAddress',
        type: 'address',
        required: true,
        description: 'Address where estimates can be inspected'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.1'
  },

  {
    id: 'service-charge-demand',
    title: 'Service Charge Demand',
    description: 'Compliant service charge demand notice under LTA 1985',
    category: 'service_charge_demand',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `SERVICE CHARGE DEMAND

To: {{leaseholderName}}
Property: {{propertyAddress}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTIONS 21B AND 47

We demand payment of the service charges detailed below for the period {{chargePeriodStart}} to {{chargePeriodEnd}}.

SERVICE CHARGE BREAKDOWN:
{{serviceChargeBreakdown}}

TOTAL AMOUNT DUE: £{{totalAmount}}
DUE DATE: {{dueDate}}

LANDLORD'S NAME AND ADDRESS:
{{landlordName}}
{{landlordAddress}}

MANAGING AGENT (if applicable):
{{managingAgent}}
{{agentAddress}}

IMPORTANT INFORMATION ABOUT YOUR RIGHTS:

1. You have the right to ask for a summary of costs which make up the service charges.

2. You have the right to inspect supporting documents and receipts.

3. You have the right to apply to the First-tier Tribunal (Property Chamber) if you believe the service charges are unreasonable.

4. You will not have to pay service charges if they have not been demanded within 18 months of being incurred, unless you have been notified in writing that costs have been incurred and that you will be required to contribute to them.

For independent advice, contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org or 0207 832 2500

Payment should be made to:
{{paymentDetails}}

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'leaseholderName',
        type: 'text',
        required: true,
        description: 'Name of the leaseholder'
      },
      {
        name: 'propertyAddress',
        type: 'address',
        required: true,
        description: 'Address of the leasehold property'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of person sending demand'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of demand'
      },
      {
        name: 'chargePeriodStart',
        type: 'date',
        required: true,
        description: 'Start date of charge period'
      },
      {
        name: 'chargePeriodEnd',
        type: 'date',
        required: true,
        description: 'End date of charge period'
      },
      {
        name: 'serviceChargeBreakdown',
        type: 'text',
        required: true,
        description: 'Detailed breakdown of service charges'
      },
      {
        name: 'totalAmount',
        type: 'currency',
        required: true,
        description: 'Total amount due'
      },
      {
        name: 'dueDate',
        type: 'date',
        required: true,
        description: 'Payment due date'
      },
      {
        name: 'landlordName',
        type: 'text',
        required: true,
        description: 'Name of landlord'
      },
      {
        name: 'landlordAddress',
        type: 'address',
        required: true,
        description: 'Address of landlord'
      },
      {
        name: 'managingAgent',
        type: 'text',
        required: false,
        description: 'Name of managing agent (if applicable)'
      },
      {
        name: 'agentAddress',
        type: 'address',
        required: false,
        description: 'Address of managing agent'
      },
      {
        name: 'paymentDetails',
        type: 'text',
        required: true,
        description: 'Payment instructions and bank details'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.0'
  },

  {
    id: 'rtm-claim-notice',
    title: 'RTM Claim Notice',
    description: 'Notice of claim to acquire right to manage under CLRA 2002',
    category: 'rtm_notice',
    framework: 'CLRA_2002',
    applicableRoles: ['rtm-director'],
    content: `NOTICE OF CLAIM TO ACQUIRE THE RIGHT TO MANAGE

To: {{recipientName}}
{{recipientAddress}}

From: {{rtmCompanyName}}
Company Number: {{companyNumber}}
Registered Office: {{registeredOffice}}

Date: {{date}}

COMMONHOLD AND LEASEHOLD REFORM ACT 2002 - CHAPTER 15

NOTICE is hereby given that {{rtmCompanyName}} claims to acquire the right to manage {{buildingName}}, {{buildingAddress}} ("the premises").

DETAILS OF THE PREMISES:
{{premisesDescription}}

PARTICULARS OF THE CLAIM:
1. The premises consist of {{totalFlats}} flats
2. {{qualifyingTenants}} qualifying tenants support this claim
3. The claim is made under Section 79 of the Commonhold and Leasehold Reform Act 2002

GROUNDS FOR THE CLAIM:
{{groundsForClaim}}

SUPPORTING DOCUMENTS:
The following documents are enclosed:
- Copy of RTM company memorandum and articles
- List of qualifying tenants who are members
- Evidence of service on all relevant parties

IMPORTANT: You have the right to serve a counter-notice within one month of service of this notice if you wish to dispute this claim.

For advice on your rights, contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org

{{directorName}}
Director
{{rtmCompanyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'recipientName',
        type: 'text',
        required: true,
        description: 'Name of recipient (landlord/freeholder)'
      },
      {
        name: 'recipientAddress',
        type: 'address',
        required: true,
        description: 'Address of recipient'
      },
      {
        name: 'rtmCompanyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company'
      },
      {
        name: 'companyNumber',
        type: 'text',
        required: true,
        description: 'Companies House registration number'
      },
      {
        name: 'registeredOffice',
        type: 'address',
        required: true,
        description: 'Registered office address'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of notice'
      },
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Name of building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Address of building'
      },
      {
        name: 'premisesDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of premises'
      },
      {
        name: 'totalFlats',
        type: 'number',
        required: true,
        description: 'Total number of flats in building'
      },
      {
        name: 'qualifyingTenants',
        type: 'number',
        required: true,
        description: 'Number of qualifying tenants supporting claim'
      },
      {
        name: 'groundsForClaim',
        type: 'text',
        required: true,
        description: 'Grounds for making the RTM claim'
      },
      {
        name: 'directorName',
        type: 'text',
        required: true,
        description: 'Name of RTM company director'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.0'
  }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): LegalTemplate[] => {
  return LEGAL_TEMPLATES.filter(template => template.category === category);
};

// Helper function to get templates by role
export const getTemplatesByRole = (role: string): LegalTemplate[] => {
  return LEGAL_TEMPLATES.filter(template => 
    template.applicableRoles.includes(role as any)
  );
};

// Helper function to get template by ID
export const getTemplateById = (id: string): LegalTemplate | undefined => {
  return LEGAL_TEMPLATES.find(template => template.id === id);
};
