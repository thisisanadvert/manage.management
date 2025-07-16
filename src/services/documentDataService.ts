/**
 * Document Data Service
 * Handles all document repository operations and database interactions
 */

import { supabase } from '../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface DocumentRecord {
  id?: string;
  building_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  category: 'legal' | 'financial' | 'insurance' | 'maintenance' | 'admin' | 'rtm' | 'compliance';
  tags?: string[];
  version: number;
  is_current_version: boolean;
  parent_document_id?: string;
  access_level: 'public' | 'building' | 'directors_only' | 'private';
  uploaded_by: string;
  approved_by?: string;
  approved_at?: string;
  expiry_date?: string;
  is_archived: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentAccessLog {
  id?: string;
  document_id: string;
  user_id?: string;
  access_type: 'view' | 'download' | 'edit' | 'delete';
  ip_address?: string;
  user_agent?: string;
  accessed_at?: string;
}

export interface DocumentComment {
  id?: string;
  document_id: string;
  user_id: string;
  comment: string;
  page_number?: number;
  annotation_data?: Record<string, any>;
  is_resolved: boolean;
  parent_comment_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentStorageStats {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  categories: Record<string, { count: number; size: number }>;
}

// =====================================================
// DOCUMENT DATA SERVICE CLASS
// =====================================================

class DocumentDataService {

  // =====================================================
  // DOCUMENT REPOSITORY
  // =====================================================

  async createDocument(document: DocumentRecord): Promise<{ data: DocumentRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .insert([document])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating document:', error);
      return { data: null, error };
    }
  }

  async getDocuments(buildingId: string, filters?: {
    category?: string;
    tags?: string[];
    access_level?: string;
    is_archived?: boolean;
  }): Promise<{ data: DocumentRecord[] | null; error: any }> {
    try {
      let query = supabase
        .from('document_repository')
        .select('*')
        .eq('building_id', buildingId);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.access_level) {
        query = query.eq('access_level', filters.access_level);
      }

      if (filters?.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { data: null, error };
    }
  }

  async getDocument(id: string): Promise<{ data: DocumentRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching document:', error);
      return { data: null, error };
    }
  }

  async updateDocument(id: string, updates: Partial<DocumentRecord>): Promise<{ data: DocumentRecord | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating document:', error);
      return { data: null, error };
    }
  }

  async deleteDocument(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('document_repository')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { error };
    }
  }

  async archiveDocument(id: string): Promise<{ data: DocumentRecord | null; error: any }> {
    return this.updateDocument(id, { is_archived: true });
  }

  async restoreDocument(id: string): Promise<{ data: DocumentRecord | null; error: any }> {
    return this.updateDocument(id, { is_archived: false });
  }

  // =====================================================
  // DOCUMENT VERSIONING
  // =====================================================

  async createNewVersion(parentDocumentId: string, newDocument: Partial<DocumentRecord>): Promise<{ data: DocumentRecord | null; error: any }> {
    try {
      // Get the parent document to inherit properties
      const { data: parentDoc, error: parentError } = await this.getDocument(parentDocumentId);
      if (parentError || !parentDoc) {
        return { data: null, error: parentError || new Error('Parent document not found') };
      }

      // Mark the current version as not current
      await this.updateDocument(parentDocumentId, { is_current_version: false });

      // Create new version
      const newVersionDoc: DocumentRecord = {
        ...parentDoc,
        ...newDocument,
        id: undefined, // Let database generate new ID
        parent_document_id: parentDocumentId,
        version: parentDoc.version + 1,
        is_current_version: true,
        created_at: undefined,
        updated_at: undefined
      };

      return this.createDocument(newVersionDoc);
    } catch (error) {
      console.error('Error creating new document version:', error);
      return { data: null, error };
    }
  }

  async getDocumentVersions(parentDocumentId: string): Promise<{ data: DocumentRecord[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .select('*')
        .or(`id.eq.${parentDocumentId},parent_document_id.eq.${parentDocumentId}`)
        .order('version', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching document versions:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // DOCUMENT ACCESS LOGGING
  // =====================================================

  async logDocumentAccess(accessLog: DocumentAccessLog): Promise<{ data: DocumentAccessLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_access_log')
        .insert([accessLog])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error logging document access:', error);
      return { data: null, error };
    }
  }

  async getDocumentAccessLog(documentId: string, limit: number = 50): Promise<{ data: DocumentAccessLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_access_log')
        .select('*')
        .eq('document_id', documentId)
        .order('accessed_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error fetching document access log:', error);
      return { data: null, error };
    }
  }

  // =====================================================
  // DOCUMENT COMMENTS
  // =====================================================

  async createDocumentComment(comment: DocumentComment): Promise<{ data: DocumentComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .insert([comment])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating document comment:', error);
      return { data: null, error };
    }
  }

  async getDocumentComments(documentId: string): Promise<{ data: DocumentComment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error fetching document comments:', error);
      return { data: null, error };
    }
  }

  async updateDocumentComment(id: string, updates: Partial<DocumentComment>): Promise<{ data: DocumentComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating document comment:', error);
      return { data: null, error };
    }
  }

  async deleteDocumentComment(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting document comment:', error);
      return { error };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  async getDocumentStorageStats(buildingId: string): Promise<{ data: DocumentStorageStats | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_document_storage_stats', { p_building_id: buildingId });

      return { data, error };
    } catch (error) {
      console.error('Error getting document storage stats:', error);
      return { data: null, error };
    }
  }

  async searchDocuments(buildingId: string, searchTerm: string): Promise<{ data: DocumentRecord[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .select('*')
        .eq('building_id', buildingId)
        .eq('is_archived', false)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error searching documents:', error);
      return { data: null, error };
    }
  }

  async getDocumentsByCategory(buildingId: string): Promise<{ data: Record<string, DocumentRecord[]> | null; error: any }> {
    try {
      const { data, error } = await this.getDocuments(buildingId, { is_archived: false });
      
      if (error || !data) {
        return { data: null, error };
      }

      const categorized = data.reduce((acc, doc) => {
        if (!acc[doc.category]) {
          acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
      }, {} as Record<string, DocumentRecord[]>);

      return { data: categorized, error: null };
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return { data: null, error };
    }
  }

  async getRecentDocuments(buildingId: string, limit: number = 10): Promise<{ data: DocumentRecord[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('document_repository')
        .select('*')
        .eq('building_id', buildingId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      return { data: null, error };
    }
  }
}

export const documentDataService = new DocumentDataService();
