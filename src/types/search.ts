/**
 * Global Search Types and Interfaces
 * Defines the structure for comprehensive search functionality across the platform
 */

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  contentTypes?: SearchContentType[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  priority?: string[];
  status?: string[];
  category?: string[];
  createdBy?: string;
  buildingId?: string;
}

export type SearchContentType = 
  | 'issues' 
  | 'announcements' 
  | 'documents' 
  | 'transactions' 
  | 'users' 
  | 'legal_templates'
  | 'suppliers'
  | 'polls';

export interface SearchResult {
  id: string;
  type: SearchContentType;
  title: string;
  description?: string;
  content?: string;
  url: string;
  relevanceScore?: number;
  metadata: SearchResultMetadata;
  highlights?: SearchHighlight[];
}

export interface SearchResultMetadata {
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  };
  category?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  buildingId?: string;
  buildingName?: string;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface SearchResults {
  query: string;
  total: number;
  results: SearchResult[];
  facets: SearchFacets;
  suggestions?: string[];
  executionTime: number;
}

export interface SearchFacets {
  contentTypes: FacetCount[];
  categories: FacetCount[];
  priorities: FacetCount[];
  statuses: FacetCount[];
  dateRanges: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  label: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  filters?: SearchFilters;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}

export interface SearchPreferences {
  defaultContentTypes: SearchContentType[];
  resultsPerPage: number;
  enableSearchHistory: boolean;
  enableSearchSuggestions: boolean;
  defaultSortOrder: 'relevance' | 'date' | 'title';
}

export interface SearchContextType {
  // Current search state
  currentQuery: string;
  currentResults: SearchResults | null;
  isSearching: boolean;
  isSearchOpen: boolean;
  
  // Search actions
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  
  // History and preferences
  searchHistory: SearchHistory[];
  savedSearches: SavedSearch[];
  preferences: SearchPreferences;
  
  // History management
  addToHistory: (query: string, resultCount: number, filters?: SearchFilters) => void;
  clearHistory: () => void;
  
  // Saved searches
  saveSearch: (name: string, query: string, filters?: SearchFilters) => void;
  deleteSavedSearch: (id: string) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<SearchPreferences>) => void;
}

// Content type configurations
export const SEARCH_CONTENT_TYPES: Record<SearchContentType, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  issues: {
    label: 'Issues',
    icon: 'AlertCircle',
    color: 'text-red-600',
    description: 'Maintenance and repair issues'
  },
  announcements: {
    label: 'Announcements',
    icon: 'Megaphone',
    color: 'text-blue-600',
    description: 'Building announcements and notices'
  },
  documents: {
    label: 'Documents',
    icon: 'FileText',
    color: 'text-green-600',
    description: 'Files and documentation'
  },
  transactions: {
    label: 'Financial',
    icon: 'DollarSign',
    color: 'text-yellow-600',
    description: 'Financial records and transactions'
  },
  users: {
    label: 'People',
    icon: 'Users',
    color: 'text-purple-600',
    description: 'Residents and building users'
  },
  legal_templates: {
    label: 'Legal',
    icon: 'Scale',
    color: 'text-indigo-600',
    description: 'Legal templates and compliance'
  },
  suppliers: {
    label: 'Suppliers',
    icon: 'Truck',
    color: 'text-orange-600',
    description: 'Service providers and suppliers'
  },
  polls: {
    label: 'Voting',
    icon: 'CheckSquare',
    color: 'text-teal-600',
    description: 'Polls and voting records'
  }
};

// Search result URL generators
export const generateSearchResultUrl = (result: SearchResult): string => {
  const baseUrls: Record<SearchContentType, string> = {
    issues: '/issues',
    announcements: '/announcements',
    documents: '/documents',
    transactions: '/finances',
    users: '/residents',
    legal_templates: '/legal/templates',
    suppliers: '/suppliers',
    polls: '/voting'
  };
  
  return `${baseUrls[result.type]}?highlight=${result.id}`;
};

// Search query validation
export const validateSearchQuery = (query: string): { valid: boolean; error?: string } => {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Search query cannot be empty' };
  }
  
  if (query.trim().length < 2) {
    return { valid: false, error: 'Search query must be at least 2 characters' };
  }
  
  if (query.length > 500) {
    return { valid: false, error: 'Search query is too long' };
  }
  
  return { valid: true };
};
