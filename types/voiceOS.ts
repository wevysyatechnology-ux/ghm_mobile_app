/**
 * WeVysya Voice OS Type Definitions
 */

// Voice command result from processing
export interface VoiceCommand {
  transcript: string;
  intent: string;
  action?: VoiceAction;
  response: string;
  shouldExecute: boolean;
}

// Executable voice action
export interface VoiceAction {
  name: string;
  parameters: Record<string, any>;
  screen?: string;
}

// Classified intent from action engine
export interface Intent {
  type: 'knowledge' | 'action';
  category?: string;
  action?: {
    name: string;
    parameters: Record<string, any>;
    screen?: string;
  };
  response: string;
  confidence: number;
}

// Knowledge document in RAG system
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

// Voice OS state
export interface VoiceOSState {
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  transcript: string;
  response: string;
  intent: string;
  confidence: number;
}

// Search result from knowledge base
export interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

// Transcription result
export interface TranscriptionResult {
  text: string;
  language?: string;
}

// Speech options
export interface SpeechOptions {
  rate?: number;      // 0.1 to 2.0
  pitch?: number;     // 0.5 to 2.0
  language?: string;  // BCP 47 language code
}

// Action execution result
export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
  navigation?: boolean;
  screen?: string;
}
