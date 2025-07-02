/**
 * Global Search Service
 * Provides comprehensive search functionality across all platform content types
 */

import { supabase } from '../lib/supabase';
import {
  SearchQuery,
  SearchResults,
  SearchResult,
  SearchContentType,
  SearchFilters,
  SearchFacets,
  FacetCount,
  SearchResultMetadata,
  generateSearchResultUrl
} from '../types/search';

class GlobalSearchService {
  private readonly SEARCH_LIMIT = 50;
  private readonly SEARCH_TIMEOUT = 5000; // 5 seconds

  /**
   * Perform a comprehensive search across all content types
   */
  async search(searchQuery: SearchQuery): Promise<SearchResults> {
    const startTime = Date.now();
    const { query, filters = {}, limit = this.SEARCH_LIMIT, offset = 0 } = searchQuery;

    try {
      // Sanitize search query for PostgreSQL full-text search
      const sanitizedQuery = this.sanitizeQuery(query);
      
      // Determine which content types to search
      const contentTypes = filters.contentTypes || [
        'issues', 'announcements', 'documents', 'transactions', 'users', 'polls'
      ];

      // Execute searches in parallel for better performance
      const searchPromises = contentTypes.map(type => 
        this.searchContentType(type, sanitizedQuery, filters, limit, offset)
      );

      const searchResults = await Promise.allSettled(searchPromises);
      
      // Combine and process results
      const allResults: SearchResult[] = [];
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          console.warn(`Search failed for ${contentTypes[index]}:`, result.reason);
        }
      });

      // Sort by relevance score (if available) or date
      const sortedResults = this.sortResults(allResults, filters);
      
      // Apply pagination
      const paginatedResults = sortedResults.slice(offset, offset + limit);

      // Generate facets for filtering
      const facets = this.generateFacets(allResults);

      const executionTime = Date.now() - startTime;

      return {
        query,
        total: allResults.length,
        results: paginatedResults,
        facets,
        suggestions: await this.generateSuggestions(query),
        executionTime
      };

    } catch (error) {
      console.error('Global search error:', error);
      throw new Error('Search failed. Please try again.');
    }
  }

  /**
   * Search within a specific content type
   */
  private async searchContentType(
    type: SearchContentType,
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    switch (type) {
      case 'issues':
        return this.searchIssues(query, filters, limit, offset);
      case 'announcements':
        return this.searchAnnouncements(query, filters, limit, offset);
      case 'documents':
        return this.searchDocuments(query, filters, limit, offset);
      case 'transactions':
        return this.searchTransactions(query, filters, limit, offset);
      case 'users':
        return this.searchUsers(query, filters, limit, offset);
      case 'polls':
        return this.searchPolls(query, filters, limit, offset);
      default:
        return [];
    }
  }

  /**
   * Search issues using full-text search
   */
  private async searchIssues(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('issues')
      .select(`
        id,
        title,
        description,
        category,
        priority,
        status,
        created_at,
        updated_at,
        reported_by,
        building_id
      `);

    // Apply full-text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Apply filters
    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }
    if (filters.priority?.length) {
      queryBuilder = queryBuilder.in('priority', filters.priority);
    }
    if (filters.status?.length) {
      queryBuilder = queryBuilder.in('status', filters.status);
    }
    if (filters.category?.length) {
      queryBuilder = queryBuilder.in('category', filters.category);
    }

    // Apply date range
    if (filters.dateRange?.from) {
      queryBuilder = queryBuilder.gte('created_at', filters.dateRange.from);
    }
    if (filters.dateRange?.to) {
      queryBuilder = queryBuilder.lte('created_at', filters.dateRange.to);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Issues search error:', error);
      return [];
    }

    return (data || []).map(issue => ({
      id: issue.id,
      type: 'issues' as SearchContentType,
      title: issue.title,
      description: issue.description,
      url: generateSearchResultUrl({ id: issue.id, type: 'issues' } as SearchResult),
      metadata: {
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        category: issue.category,
        priority: issue.priority,
        status: issue.status,
        buildingId: issue.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Search announcements
   */
  private async searchAnnouncements(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        category,
        priority,
        created_at,
        updated_at,
        posted_by,
        building_id
      `);

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,content.ilike.%${query}%`
      );
    }

    // Apply filters similar to issues
    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }
    if (filters.priority?.length) {
      queryBuilder = queryBuilder.in('priority', filters.priority);
    }
    if (filters.category?.length) {
      queryBuilder = queryBuilder.in('category', filters.category);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Announcements search error:', error);
      return [];
    }

    return (data || []).map(announcement => ({
      id: announcement.id,
      type: 'announcements' as SearchContentType,
      title: announcement.title,
      description: announcement.content?.substring(0, 200) + '...',
      content: announcement.content,
      url: generateSearchResultUrl({ id: announcement.id, type: 'announcements' } as SearchResult),
      metadata: {
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at,
        category: announcement.category,
        priority: announcement.priority,
        buildingId: announcement.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Search documents
   */
  private async searchDocuments(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('onboarding_documents')
      .select(`
        id,
        document_type,
        storage_path,
        created_at,
        uploaded_by,
        building_id
      `);

    if (query) {
      queryBuilder = queryBuilder.ilike('storage_path', `%${query}%`);
    }

    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Documents search error:', error);
      return [];
    }

    return (data || []).map(doc => ({
      id: doc.id,
      type: 'documents' as SearchContentType,
      title: this.extractFilename(doc.storage_path),
      description: `${doc.document_type} document`,
      url: generateSearchResultUrl({ id: doc.id, type: 'documents' } as SearchResult),
      metadata: {
        createdAt: doc.created_at,
        category: doc.document_type,
        buildingId: doc.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Search financial transactions
   */
  private async searchTransactions(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('transactions')
      .select(`
        id,
        description,
        amount,
        category,
        transaction_date,
        created_at,
        building_id
      `);

    if (query) {
      queryBuilder = queryBuilder.or(
        `description.ilike.%${query}%,category.ilike.%${query}%`
      );
    }

    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }

    const { data, error } = await queryBuilder
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Transactions search error:', error);
      return [];
    }

    return (data || []).map(transaction => ({
      id: transaction.id,
      type: 'transactions' as SearchContentType,
      title: transaction.description,
      description: `£${transaction.amount} - ${transaction.category}`,
      url: generateSearchResultUrl({ id: transaction.id, type: 'transactions' } as SearchResult),
      metadata: {
        createdAt: transaction.transaction_date,
        category: transaction.category,
        buildingId: transaction.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Search users (with privacy considerations)
   */
  private async searchUsers(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    // Note: This should be restricted based on user permissions
    // For now, we'll search building_users table for basic info
    let queryBuilder = supabase
      .from('building_users')
      .select(`
        user_id,
        role,
        created_at,
        building_id,
        buildings(name)
      `);

    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Users search error:', error);
      return [];
    }

    return (data || []).map(user => ({
      id: user.user_id,
      type: 'users' as SearchContentType,
      title: `${user.role} - ${user.buildings?.name || 'Unknown Building'}`,
      description: `Building resident`,
      url: generateSearchResultUrl({ id: user.user_id, type: 'users' } as SearchResult),
      metadata: {
        createdAt: user.created_at,
        category: user.role,
        buildingId: user.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Search polls
   */
  private async searchPolls(
    query: string,
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        poll_type,
        status,
        created_at,
        building_id
      `);

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    if (filters.buildingId) {
      queryBuilder = queryBuilder.eq('building_id', filters.buildingId);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Polls search error:', error);
      return [];
    }

    return (data || []).map(poll => ({
      id: poll.id,
      type: 'polls' as SearchContentType,
      title: poll.title,
      description: poll.description,
      url: generateSearchResultUrl({ id: poll.id, type: 'polls' } as SearchResult),
      metadata: {
        createdAt: poll.created_at,
        category: poll.poll_type,
        status: poll.status,
        buildingId: poll.building_id
      } as SearchResultMetadata
    }));
  }

  /**
   * Sanitize search query for PostgreSQL
   */
  private sanitizeQuery(query: string): string {
    return query
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Sort search results by relevance and date
   */
  private sortResults(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.sort((a, b) => {
      // Primary sort: relevance score (if available)
      if (a.relevanceScore && b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // Secondary sort: date (newest first)
      const dateA = new Date(a.metadata.createdAt).getTime();
      const dateB = new Date(b.metadata.createdAt).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Generate search facets for filtering
   */
  private generateFacets(results: SearchResult[]): SearchFacets {
    const contentTypes: Record<string, number> = {};
    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    const statuses: Record<string, number> = {};

    results.forEach(result => {
      // Count content types
      contentTypes[result.type] = (contentTypes[result.type] || 0) + 1;
      
      // Count categories
      if (result.metadata.category) {
        categories[result.metadata.category] = (categories[result.metadata.category] || 0) + 1;
      }
      
      // Count priorities
      if (result.metadata.priority) {
        priorities[result.metadata.priority] = (priorities[result.metadata.priority] || 0) + 1;
      }
      
      // Count statuses
      if (result.metadata.status) {
        statuses[result.metadata.status] = (statuses[result.metadata.status] || 0) + 1;
      }
    });

    return {
      contentTypes: Object.entries(contentTypes).map(([value, count]) => ({
        value,
        count,
        label: value.charAt(0).toUpperCase() + value.slice(1)
      })),
      categories: Object.entries(categories).map(([value, count]) => ({
        value,
        count,
        label: value
      })),
      priorities: Object.entries(priorities).map(([value, count]) => ({
        value,
        count,
        label: value
      })),
      statuses: Object.entries(statuses).map(([value, count]) => ({
        value,
        count,
        label: value
      })),
      dateRanges: [] // TODO: Implement date range facets
    };
  }

  /**
   * Generate search suggestions based on query
   */
  private async generateSuggestions(query: string): Promise<string[]> {
    // Simple implementation - can be enhanced with ML/AI
    const commonTerms = [
      'maintenance', 'repair', 'urgent', 'water', 'heating', 'electricity',
      'insurance', 'budget', 'service charge', 'meeting', 'vote', 'poll'
    ];
    
    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Extract filename from storage path
   */
  private extractFilename(path: string): string {
    return path.split('/').pop() || path;
  }
}

export default new GlobalSearchService();
