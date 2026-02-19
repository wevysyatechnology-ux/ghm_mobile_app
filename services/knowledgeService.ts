import { supabase } from '@/lib/supabase';
import { getEmbeddingsEndpoint, fetchWithErrorHandling } from '@/lib/apiConfig';

export interface KnowledgeDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    title: string;
    category: string;
    source: string;
  };
}

/**
 * 🧠 Knowledge Brain with RAG (Retrieval Augmented Generation)
 * 
 * Prevents hallucination by grounding responses in actual knowledge base
 */
class KnowledgeService {
  private knowledgeCache: Map<string, KnowledgeDocument[]> = new Map();

  /**
   * Initialize knowledge base in Supabase
   * Creates necessary tables and functions
   */
  async initializeKnowledgeBase(): Promise<void> {
    try {
      // Create knowledge_base table if it doesn't exist
      const { error } = await supabase.rpc('create_knowledge_base_table');
      
      if (error && !error.message.includes('already exists')) {
        console.error('❌ Failed to initialize knowledge base:', error);
      } else {
        console.log('✅ Knowledge base initialized');
      }
    } catch (error) {
      console.error('❌ Knowledge base initialization error:', error);
    }
  }

  /**
   * Add document to knowledge base with embeddings
   */
  async addDocument(document: Omit<KnowledgeDocument, 'id' | 'embedding'>): Promise<void> {
    try {
      // Generate embedding for the document
      const embedding = await this.generateEmbedding(document.content);

      // Store in Supabase
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          content: document.content,
          embedding: embedding,
          metadata: document.metadata,
        });

      if (error) {
        console.error('❌ Failed to add document:', error);
        throw error;
      }

      console.log('✅ Document added:', document.metadata.title);
      
      // Clear cache
      this.knowledgeCache.clear();
    } catch (error) {
      console.error('❌ Error adding document:', error);
      throw error;
    }
  }

  /**
   * Upsert document (insert or update if exists)
   * Prevents duplicate entries by checking title and category
   * @returns true if inserted, false if already existed
   */
  async upsertDocument(document: Omit<KnowledgeDocument, 'id' | 'embedding'>): Promise<boolean> {
    try {
      // Check if document already exists by title
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('id')
        .eq('metadata->>title', document.metadata.title)
        .eq('metadata->>category', document.metadata.category)
        .limit(1);

      // If exists, skip insertion
      if (existing && existing.length > 0) {
        console.log('⏭️ Document already exists (skipping):', document.metadata.title);
        return false;
      }

      // Otherwise, add the document
      await this.addDocument(document);
      return true;
    } catch (error) {
      console.error('❌ Error upserting document:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base using semantic search
   * This is the core RAG retrieval function
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<string> {
    try {
      console.log('🔍 Searching knowledge base for:', query);

      // Try keyword search first (works without embeddings)
      const keywordResult = await this.keywordSearch(query, limit);
      
      if (keywordResult && keywordResult !== 'No relevant information found in knowledge base.') {
        return keywordResult;
      }

      // If keyword search fails, try embedding-based search
      try {
        const queryEmbedding = await this.generateEmbedding(query);
        
        if (queryEmbedding) {
          const { data, error } = await supabase.rpc('search_knowledge', {
            query_embedding: queryEmbedding,
            match_limit: limit,
          });

          if (!error && data && data.length > 0) {
            const context = data
              .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
              .join('\n\n---\n\n');
            
            console.log('✅ Found', data.length, 'relevant documents (embedding search)');
            return context;
          }
        }
      } catch (embeddingError) {
        console.log('⚠️ Embedding search not available, using keyword search');
      }

      // Return keyword result or empty string
      return keywordResult;
    } catch (error) {
      console.error('❌ Search failed:', error);
      return 'WeVysya is a business network. I can help you find members, post deals, and more.';
    }
  }

  /**
   * Fallback keyword search
   */
  private async keywordSearch(query: string, limit: number): Promise<string> {
    try {
      console.log('🔎 Performing keyword search for:', query);
      
      // Try simple text search using ilike (case-insensitive LIKE)
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('content, metadata')
        .or(`content.ilike.${searchTerm},metadata->>title.ilike.${searchTerm}`)
        .limit(limit);

      if (error) {
        console.error('❌ Keyword search error:', error);
        // Return all documents as fallback
        const { data: allDocs } = await supabase
          .from('knowledge_base')
          .select('content, metadata')
          .limit(limit);
        
        if (allDocs && allDocs.length > 0) {
          console.log('✅ Returning all documents as fallback');
          return allDocs
            .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
            .join('\n\n---\n\n');
        }
        
        return 'No relevant information found.';
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No keyword matches, returning all documents');
        // Return all documents if no matches
        const { data: allDocs } = await supabase
          .from('knowledge_base')
          .select('content, metadata')
          .limit(limit);
        
        if (allDocs && allDocs.length > 0) {
          return allDocs
            .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
            .join('\n\n---\n\n');
        }
        
        return 'No relevant information found.';
      }

      console.log('✅ Found', data.length, 'documents via keyword search');
      return data
        .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
        .join('\n\n---\n\n');
    } catch (error) {
      console.error('❌ Keyword search failed:', error);
      return 'WeVysya is a business community network.';
    }
  }

  /**
   * Generate embedding using backend proxy endpoint
   * The actual OpenAI API call is made server-side for security
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Call backend proxy endpoint via Supabase Edge Function
      const endpoint = getEmbeddingsEndpoint();
      
      const data = await fetchWithErrorHandling<{ embedding: number[] }>(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        }
      );

      return data.embedding;
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Batch load knowledge documents
   * Prevents duplicates by checking existing documents
   */
  async loadKnowledgeBase(documents: Array<Omit<KnowledgeDocument, 'id' | 'embedding'>>): Promise<void> {
    console.log(`📚 Loading ${documents.length} documents...`);
    
    let loaded = 0;
    let skipped = 0;
    
    for (const doc of documents) {
      try {
        // Use upsert to prevent duplicates
        const inserted = await this.upsertDocument(doc);
        if (inserted) {
          loaded++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Failed to load: ${doc.metadata.title}`, error);
        skipped++;
      }
    }
    
    console.log(`✅ Knowledge base loaded: ${loaded} added, ${skipped} skipped/failed`);
  }

  /**
   * Get document by category
   */
  async getDocumentsByCategory(category: string): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('metadata->>category', category);

      if (error) {
        console.error('❌ Failed to get documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      return [];
    }
  }

  /**
   * Clear knowledge base
   */
  async clearKnowledgeBase(): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('❌ Failed to clear knowledge base:', error);
      } else {
        console.log('✅ Knowledge base cleared');
        this.knowledgeCache.clear();
      }
    } catch (error) {
      console.error('❌ Error clearing knowledge base:', error);
    }
  }
}

export const knowledgeService = new KnowledgeService();
