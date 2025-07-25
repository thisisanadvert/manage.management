/**
 * MRI Qube Integration Types
 * TypeScript interfaces for MRI Qube API data structures and responses
 */

// ============================================================================
// API Configuration & Authentication
// ============================================================================

export interface MRIConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  environment: 'sandbox' | 'production';
}

export interface MRIOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  obtained_at: number;
}

export interface MRIApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Property & Building Data
// ============================================================================

export interface MRIProperty {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  propertyType: 'residential' | 'commercial' | 'mixed';
  totalUnits: number;
  managementType: 'rtm' | 'rmc' | 'landlord' | 'freehold';
  createdDate: string;
  lastModified: string;
  status: 'active' | 'inactive';
  portfolio?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MRIUnit {
  id: string;
  propertyId: string;
  unitNumber: string;
  unitType: 'flat' | 'house' | 'commercial' | 'parking';
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
  serviceChargePercentage?: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Tenancy & Contact Data
// ============================================================================

export interface MRITenancy {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  tenancyType: 'leasehold' | 'freehold' | 'rental' | 'commercial';
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  rentAmount?: number;
  serviceChargeAmount?: number;
  depositAmount?: number;
  createdDate: string;
  lastModified: string;
}

export interface MRIContact {
  id: string;
  type: 'tenant' | 'owner' | 'director' | 'agent' | 'supplier';
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Financial Data
// ============================================================================

export interface MRITransaction {
  id: string;
  propertyId: string;
  unitId?: string;
  tenancyId?: string;
  type: 'payment' | 'charge' | 'refund' | 'adjustment';
  category: string;
  description: string;
  amount: number;
  currency: string;
  transactionDate: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  paymentMethod?: string;
  createdDate: string;
  lastModified: string;
}

export interface MRIBudget {
  id: string;
  propertyId: string;
  year: number;
  period: 'annual' | 'quarterly' | 'monthly';
  category: string;
  description: string;
  budgetAmount: number;
  actualAmount?: number;
  variance?: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  createdDate: string;
  lastModified: string;
}

export interface MRIInvoice {
  id: string;
  propertyId: string;
  supplierId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue' | 'disputed';
  category: string;
  vatAmount?: number;
  netAmount?: number;
  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Maintenance & Work Orders
// ============================================================================

export interface MRIWorkOrder {
  id: string;
  propertyId: string;
  unitId?: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  requestedBy?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Documents & Compliance
// ============================================================================

export interface MRIDocument {
  id: string;
  propertyId: string;
  unitId?: string;
  title: string;
  description?: string;
  category: 'legal' | 'financial' | 'insurance' | 'maintenance' | 'compliance';
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'archived';
  tags?: string[];
  createdDate: string;
  lastModified: string;
}

// ============================================================================
// Sync & Integration Data
// ============================================================================

export interface MRISyncStatus {
  id: string;
  entityType: 'properties' | 'tenancies' | 'transactions' | 'budgets' | 'invoices' | 'maintenance' | 'documents';
  lastSyncDate: string;
  nextSyncDate: string;
  status: 'success' | 'error' | 'in_progress' | 'pending';
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsSkipped: number;
  errorMessage?: string;
  syncDuration?: number;
}

export interface MRISyncConfig {
  id: string;
  buildingId: string;
  mriPropertyId: string;
  isEnabled: boolean;
  syncFrequency: {
    properties: 'daily' | 'weekly' | 'manual';
    tenancies: 'daily' | 'weekly' | 'manual';
    transactions: 'realtime' | 'hourly' | 'daily';
    budgets: 'weekly' | 'monthly' | 'manual';
    invoices: 'realtime' | 'hourly' | 'daily';
    maintenance: 'daily' | 'weekly' | 'manual';
    documents: 'weekly' | 'monthly' | 'manual';
  };
  lastConfigUpdate: string;
  createdBy: string;
  createdDate: string;
}

export interface MRISyncError {
  id: string;
  syncId: string;
  entityType: string;
  entityId: string;
  errorType: 'validation' | 'api' | 'database' | 'mapping';
  errorMessage: string;
  errorDetails?: any;
  retryCount: number;
  maxRetries: number;
  resolved: boolean;
  createdDate: string;
  resolvedDate?: string;
}

// ============================================================================
// Service Configuration
// ============================================================================

export interface MRIServiceConfig {
  rateLimiting: {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
  };
  retry: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  timeout: {
    connectionTimeout: number;
    requestTimeout: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableApiLogging: boolean;
    enablePerformanceLogging: boolean;
  };
}
