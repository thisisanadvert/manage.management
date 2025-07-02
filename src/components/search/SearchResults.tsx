/**
 * Search Results Component
 * Displays categorized search results with highlighting and navigation
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Megaphone, 
  FileText, 
  DollarSign, 
  Users, 
  Scale, 
  Truck, 
  CheckSquare,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { SearchResult, SearchContentType, SEARCH_CONTENT_TYPES } from '../../types/search';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface SearchResultsProps {
  onResultClick?: () => void;
  maxHeight?: string;
  showCategories?: boolean;
  compact?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  onResultClick,
  maxHeight = "400px",
  showCategories = true,
  compact = false
}) => {
  const { currentResults, isSearching, currentQuery } = useSearch();
  const navigate = useNavigate();

  // Icon mapping for content types
  const iconMap: Record<SearchContentType, React.ComponentType<{ size?: number; className?: string }>> = {
    issues: AlertCircle,
    announcements: Megaphone,
    documents: FileText,
    transactions: DollarSign,
    users: Users,
    legal_templates: Scale,
    suppliers: Truck,
    polls: CheckSquare
  };

  // Group results by content type
  const groupedResults = useMemo(() => {
    if (!currentResults?.results) return {};
    
    return currentResults.results.reduce((groups, result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
      return groups;
    }, {} as Record<SearchContentType, SearchResult[]>);
  }, [currentResults?.results]);

  /**
   * Handle result click navigation
   */
  const handleResultClick = (result: SearchResult) => {
    // Navigate to the result
    navigate(result.url);
    onResultClick?.();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * Highlight search terms in text
   */
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  /**
   * Render individual search result
   */
  const renderResult = (result: SearchResult) => {
    const Icon = iconMap[result.type];
    const config = SEARCH_CONTENT_TYPES[result.type];
    
    return (
      <button
        key={result.id}
        onClick={() => handleResultClick(result)}
        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
          compact ? 'p-3' : 'p-4'
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            result.type === 'issues' ? 'bg-red-100 text-red-600' :
            result.type === 'announcements' ? 'bg-blue-100 text-blue-600' :
            result.type === 'documents' ? 'bg-green-100 text-green-600' :
            result.type === 'transactions' ? 'bg-yellow-100 text-yellow-600' :
            result.type === 'users' ? 'bg-purple-100 text-purple-600' :
            result.type === 'legal_templates' ? 'bg-indigo-100 text-indigo-600' :
            result.type === 'suppliers' ? 'bg-orange-100 text-orange-600' :
            'bg-teal-100 text-teal-600'
          }`}>
            <Icon size={compact ? 16 : 18} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className={`font-medium text-gray-900 truncate ${
                  compact ? 'text-sm' : 'text-base'
                }`}>
                  {highlightText(result.title, currentQuery)}
                </h3>
                
                {/* Description */}
                {result.description && (
                  <p className={`text-gray-600 mt-1 line-clamp-2 ${
                    compact ? 'text-xs' : 'text-sm'
                  }`}>
                    {highlightText(result.description, currentQuery)}
                  </p>
                )}
                
                {/* Metadata */}
                <div className={`flex items-center space-x-3 mt-2 ${
                  compact ? 'text-xs' : 'text-sm'
                } text-gray-500`}>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{formatDate(result.metadata.createdAt)}</span>
                  </div>
                  
                  {result.metadata.category && (
                    <Badge variant="secondary" size="sm">
                      {result.metadata.category}
                    </Badge>
                  )}
                  
                  {result.metadata.priority && (
                    <Badge 
                      variant={
                        result.metadata.priority === 'Critical' ? 'error' :
                        result.metadata.priority === 'High' ? 'warning' :
                        'secondary'
                      }
                      size="sm"
                    >
                      {result.metadata.priority}
                    </Badge>
                  )}
                  
                  {result.metadata.status && (
                    <Badge variant="gray" size="sm">
                      {result.metadata.status}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* External link indicator */}
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </button>
    );
  };

  /**
   * Render results by category
   */
  const renderCategorizedResults = () => {
    return Object.entries(groupedResults).map(([type, results]) => {
      const config = SEARCH_CONTENT_TYPES[type as SearchContentType];
      const Icon = iconMap[type as SearchContentType];
      
      return (
        <div key={type} className="mb-6 last:mb-0">
          {/* Category Header */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <Icon size={16} className={config.color} />
            <h3 className="font-medium text-gray-900">{config.label}</h3>
            <Badge variant="secondary" size="sm">
              {results.length}
            </Badge>
          </div>
          
          {/* Results */}
          <div>
            {results.map(renderResult)}
          </div>
        </div>
      );
    });
  };

  // Loading state
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  // No results
  if (currentResults && currentResults.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileText size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search terms or filters
        </p>
        {currentQuery && (
          <p className="text-sm text-gray-500">
            Searched for: <span className="font-medium">"{currentQuery}"</span>
          </p>
        )}
      </div>
    );
  }

  // No search performed yet
  if (!currentResults) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileText size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
        <p className="text-gray-600">
          Search across issues, documents, announcements, and more
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ maxHeight, overflowY: 'auto' }}>
      {/* Results Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">
              {currentResults.total} result{currentResults.total !== 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-gray-600">
              Found in {currentResults.executionTime}ms
            </p>
          </div>
          
          {currentQuery && (
            <div className="text-sm text-gray-500">
              for "<span className="font-medium">{currentQuery}</span>"
            </div>
          )}
        </div>
      </div>
      
      {/* Results Content */}
      <div className="divide-y divide-gray-100">
        {showCategories ? (
          renderCategorizedResults()
        ) : (
          currentResults.results.map(renderResult)
        )}
      </div>
    </div>
  );
};

export default SearchResults;
