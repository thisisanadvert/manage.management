class DocumentDataService {
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