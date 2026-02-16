import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

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
   * Search knowledge base using semantic search
   * This is the core RAG retrieval function
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<string> {
    try {
      console.log('🔍 Searching knowledge base for:', query);

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Search using vector similarity in Supabase
      // This requires pgvector extension and similarity search function
      const { data, error } = await supabase.rpc('search_knowledge', {
        query_embedding: queryEmbedding,
        match_limit: limit,
      });

      if (error) {
        console.error('❌ Knowledge search error:', error);
        // Fallback to keyword search
        return await this.keywordSearch(query, limit);
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No relevant knowledge found');
        return 'No relevant information found in knowledge base.';
      }

      // Combine results into context
      const context = data
        .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
        .join('\n\n---\n\n');

      console.log('✅ Found', data.length, 'relevant documents');
      return context;
    } catch (error) {
      console.error('❌ Search failed:', error);
      return await this.keywordSearch(query, limit);
    }
  }

  /**
   * Fallback keyword search
   */
  private async keywordSearch(query: string, limit: number): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english',
        })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return 'No relevant information found.';
      }

      return data
        .map((doc: any) => `${doc.metadata.title}:\n${doc.content}`)
        .join('\n\n---\n\n');
    } catch (error) {
      console.error('❌ Keyword search failed:', error);
      return 'No relevant information found.';
    }
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Batch load knowledge documents
   */
  async loadKnowledgeBase(documents: Array<Omit<KnowledgeDocument, 'id' | 'embedding'>>): Promise<void> {
    console.log(`📚 Loading ${documents.length} documents...`);
    
    for (const doc of documents) {
      try {
        await this.addDocument(doc);
        console.log(`✅ Loaded: ${doc.metadata.title}`);
      } catch (error) {
        console.error(`❌ Failed to load: ${doc.metadata.title}`, error);
      }
    }
    
    console.log('✅ Knowledge base loaded');
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
