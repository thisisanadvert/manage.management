/**
 * Search Context
 * Manages global search state, history, and preferences across the platform
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import globalSearchService from '../services/globalSearchService';
import {
  SearchContextType,
  SearchResults,
  SearchFilters,
  SearchHistory,
  SavedSearch,
  SearchPreferences,
  validateSearchQuery
} from '../types/search';

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const defaultPreferences: SearchPreferences = {
  defaultContentTypes: ['issues', 'announcements', 'documents', 'legal_templates', 'suppliers', 'rtm_tools'],
  resultsPerPage: 20,
  enableSearchHistory: true,
  enableSearchSuggestions: true,
  defaultSortOrder: 'relevance'
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Search state
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentResults, setCurrentResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // History and preferences
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [preferences, setPreferences] = useState<SearchPreferences>(defaultPreferences);

  // Load user preferences and history on mount
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
      loadSearchHistory();
      loadSavedSearches();
    }
  }, [user?.id]);

  // Save preferences when they change
  useEffect(() => {
    if (user?.id) {
      saveUserPreferences();
    }
  }, [preferences, user?.id]);

  /**
   * Load user preferences from localStorage
   */
  const loadUserPreferences = useCallback(() => {
    if (!user?.id) return;
    
    try {
      const saved = localStorage.getItem(`search_preferences_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading search preferences:', error);
    }
  }, [user?.id]);

  /**
   * Save user preferences to localStorage
   */
  const saveUserPreferences = useCallback(() => {
    if (!user?.id) return;
    
    try {
      localStorage.setItem(`search_preferences_${user.id}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving search preferences:', error);
    }
  }, [user?.id, preferences]);

  /**
   * Load search history from localStorage
   */
  const loadSearchHistory = useCallback(() => {
    if (!user?.id || !preferences.enableSearchHistory) return;
    
    try {
      const saved = localStorage.getItem(`search_history_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed.slice(0, 50)); // Limit to 50 recent searches
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, [user?.id, preferences.enableSearchHistory]);

  /**
   * Save search history to localStorage
   */
  const saveSearchHistory = useCallback((history: SearchHistory[]) => {
    if (!user?.id || !preferences.enableSearchHistory) return;
    
    try {
      localStorage.setItem(`search_history_${user.id}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [user?.id, preferences.enableSearchHistory]);

  /**
   * Load saved searches from localStorage
   */
  const loadSavedSearches = useCallback(() => {
    if (!user?.id) return;
    
    try {
      const saved = localStorage.getItem(`saved_searches_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, [user?.id]);

  /**
   * Save saved searches to localStorage
   */
  const saveSavedSearches = useCallback((searches: SavedSearch[]) => {
    if (!user?.id) return;
    
    try {
      localStorage.setItem(`saved_searches_${user.id}`, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving saved searches:', error);
    }
  }, [user?.id]);

  /**
   * Add search to history
   */
  const addToHistory = useCallback((query: string, resultCount: number, filters?: SearchFilters) => {
    if (!preferences.enableSearchHistory) return;

    const historyItem: SearchHistory = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      timestamp: new Date().toISOString(),
      resultCount,
      filters
    };

    setSearchHistory(prev => {
      // Remove duplicate queries
      const filtered = prev.filter(item => item.query !== query);
      const newHistory = [historyItem, ...filtered].slice(0, 50);
      saveSearchHistory(newHistory);
      return newHistory;
    });
  }, [preferences.enableSearchHistory, saveSearchHistory]);

  /**
   * Perform a search
   */
  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    console.log('🔍 SearchContext: Starting search for:', query);
    console.log('🔍 SearchContext: User building ID:', user?.metadata?.buildingId);
    console.log('🔍 SearchContext: Preferences:', preferences);

    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      console.error('❌ SearchContext: Invalid query:', validation.error);
      throw new Error(validation.error);
    }

    setIsSearching(true);
    setCurrentQuery(query);

    try {
      // Apply user's building context if available
      const searchFilters: SearchFilters = {
        ...filters,
        buildingId: filters?.buildingId || user?.metadata?.buildingId,
        contentTypes: filters?.contentTypes || preferences.defaultContentTypes
      };

      console.log('🔍 SearchContext: Final search filters:', searchFilters);

      const results = await globalSearchService.search({
        query,
        filters: searchFilters,
        limit: preferences.resultsPerPage
      });

      console.log('✅ SearchContext: Search results:', results);
      setCurrentResults(results);

      // Add to search history
      if (preferences.enableSearchHistory) {
        addToHistory(query, results.total, searchFilters);
      }

    } catch (error) {
      console.error('❌ SearchContext: Search error:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [user?.metadata?.buildingId, preferences, addToHistory]);

  /**
   * Clear current search
   */
  const clearSearch = useCallback(() => {
    setCurrentQuery('');
    setCurrentResults(null);
    setIsSearching(false);
  }, []);

  /**
   * Open search interface
   */
  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  /**
   * Close search interface
   */
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);



  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    if (user?.id) {
      localStorage.removeItem(`search_history_${user.id}`);
    }
  }, [user?.id]);

  /**
   * Save a search for later use
   */
  const saveSearch = useCallback((name: string, query: string, filters?: SearchFilters) => {
    const savedSearch: SavedSearch = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      query,
      filters,
      createdAt: new Date().toISOString(),
      useCount: 0
    };

    setSavedSearches(prev => {
      const newSavedSearches = [...prev, savedSearch];
      saveSavedSearches(newSavedSearches);
      return newSavedSearches;
    });
  }, [saveSavedSearches]);

  /**
   * Delete a saved search
   */
  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => {
      const filtered = prev.filter(search => search.id !== id);
      saveSavedSearches(filtered);
      return filtered;
    });
  }, [saveSavedSearches]);

  /**
   * Update search preferences
   */
  const updatePreferences = useCallback((newPreferences: Partial<SearchPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  // Keyboard shortcut handler - DISABLED (search feature removed)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Search shortcuts disabled - feature removed
      // TODO: Re-enable when search feature is ready

      // Cmd/Ctrl + K to open search - DISABLED
      // if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      //   event.preventDefault();
      //   openSearch();
      // }

      // Escape to close search - DISABLED
      // if (event.key === 'Escape' && isSearchOpen) {
      //   closeSearch();
      // }
    };

    // Keyboard shortcuts disabled for now
    // document.addEventListener('keydown', handleKeyDown);
    // return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, openSearch, closeSearch]);

  const contextValue: SearchContextType = {
    // Current search state
    currentQuery,
    currentResults,
    isSearching,
    isSearchOpen,
    
    // Search actions
    search,
    clearSearch,
    openSearch,
    closeSearch,
    
    // History and preferences
    searchHistory,
    savedSearches,
    preferences,
    
    // History management
    addToHistory,
    clearHistory,
    
    // Saved searches
    saveSearch,
    deleteSavedSearch,
    
    // Preferences
    updatePreferences
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

/**
 * Hook to use search context
 */
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
