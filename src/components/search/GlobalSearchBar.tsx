/**
 * Global Search Bar Component
 * Main search interface with autocomplete, suggestions, and keyboard shortcuts
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Clock, Bookmark, Filter, Command } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { SearchFilters, SearchContentType, SEARCH_CONTENT_TYPES } from '../../types/search';
import Button from '../ui/Button';

interface GlobalSearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  onResultClick?: () => void;
  className?: string;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder = "Search issues, documents, announcements...",
  showFilters = true,
  autoFocus = false,
  onResultClick,
  className = ""
}) => {
  const {
    currentQuery,
    isSearching,
    isSearchOpen,
    searchHistory,
    savedSearches,
    preferences,
    search,
    clearSearch,
    openSearch,
    closeSearch
  } = useSearch();

  const [inputValue, setInputValue] = useState(currentQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Update input value when current query changes
  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  /**
   * Handle search execution
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    console.log('🔍 GlobalSearchBar: Executing search for:', query);
    console.log('🔍 GlobalSearchBar: Filters:', filters);

    try {
      // Open search modal if not already open (for header search bar)
      if (!isSearchOpen) {
        openSearch();
      }

      await search(query, filters);
      setShowSuggestions(false);
      console.log('✅ GlobalSearchBar: Search completed successfully');
    } catch (error) {
      console.error('❌ GlobalSearchBar: Search failed:', error);
      // TODO: Show error toast
    }
  }, [search, filters, isSearchOpen, openSearch]);

  /**
   * Handle input change with debounced search
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Show suggestions when typing
    if (value.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      clearSearch();
    }
  }, [clearSearch]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSearch(inputValue.trim());
    }
  }, [inputValue, handleSearch]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const suggestions = getSuggestions();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          if (selectedSuggestion.type === 'history' || selectedSuggestion.type === 'saved') {
            setInputValue(selectedSuggestion.query);
            handleSearch(selectedSuggestion.query);
          }
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        if (isSearchOpen) {
          closeSearch();
        }
        break;
    }
  }, [showSuggestions, selectedSuggestionIndex, handleSearch, isSearchOpen, closeSearch]);

  /**
   * Get search suggestions (history + saved searches)
   */
  const getSuggestions = useCallback(() => {
    const suggestions: Array<{
      type: 'history' | 'saved';
      query: string;
      label: string;
      meta?: string;
    }> = [];

    // Add relevant search history
    if (preferences.enableSearchHistory && inputValue.length > 0) {
      const relevantHistory = searchHistory
        .filter(item => 
          item.query.toLowerCase().includes(inputValue.toLowerCase()) &&
          item.query !== inputValue
        )
        .slice(0, 3);
      
      suggestions.push(...relevantHistory.map(item => ({
        type: 'history' as const,
        query: item.query,
        label: item.query,
        meta: `${item.resultCount} results`
      })));
    }

    // Add saved searches
    const relevantSaved = savedSearches
      .filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.query.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 2);
    
    suggestions.push(...relevantSaved.map(item => ({
      type: 'saved' as const,
      query: item.query,
      label: item.name,
      meta: item.query
    })));

    return suggestions.slice(0, 5);
  }, [inputValue, searchHistory, savedSearches, preferences.enableSearchHistory]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: ReturnType<typeof getSuggestions>[0]) => {
    setInputValue(suggestion.query);
    handleSearch(suggestion.query);
    onResultClick?.();
  }, [handleSearch, onResultClick]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const suggestions = getSuggestions();
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-2 rounded-lg border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            disabled={isSearching}
          />
          
          {/* Search Icon */}
          <Search
            size={18}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              isSearching ? 'text-primary-500 animate-pulse' : 'text-gray-400'
            }`}
          />
          
          {/* Right Side Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Clear Button */}
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  clearSearch();
                  setShowSuggestions(false);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={16} />
              </button>
            )}
            
            {/* Filter Button */}
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFilters)}
                className={`p-1 rounded transition-colors ${
                  hasActiveFilters 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Filter size={16} />
              </button>
            )}
            
            {/* Keyboard Shortcut Hint */}
            {!isSearchOpen && (
              <div className="hidden md:flex items-center space-x-1 text-xs text-gray-400 ml-2">
                <Command size={12} />
                <span>K</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.query}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedSuggestionIndex ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {suggestion.type === 'history' ? (
                  <Clock size={16} className="text-gray-400" />
                ) : (
                  <Bookmark size={16} className="text-primary-500" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.label}
                  </div>
                  {suggestion.meta && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.meta}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Search Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
          
          {/* Content Types Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Types
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SEARCH_CONTENT_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => {
                    const currentTypes = filters.contentTypes || [];
                    const newTypes = currentTypes.includes(type as SearchContentType)
                      ? currentTypes.filter(t => t !== type)
                      : [...currentTypes, type as SearchContentType];
                    handleFilterChange({ contentTypes: newTypes });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.contentTypes?.includes(type as SearchContentType)
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.from || ''}
                onChange={(e) => handleFilterChange({
                  dateRange: { ...filters.dateRange, from: e.target.value }
                })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.to || ''}
                onChange={(e) => handleFilterChange({
                  dateRange: { ...filters.dateRange, to: e.target.value }
                })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
