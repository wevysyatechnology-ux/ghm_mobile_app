/**
 * API Configuration for Backend Proxies
 * 
 * This module provides centralized configuration for backend API endpoints
 * that proxy OpenAI API calls securely.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

/**
 * Get the base URL for API functions
 * In development with local Supabase: http://localhost:54321
 * In production: https://{project}.supabase.co
 */
function getApiBaseUrl(): string {
  if (!SUPABASE_URL) {
    console.warn('⚠️ EXPO_PUBLIC_SUPABASE_URL not set. API calls may fail.');
    return 'http://localhost:54321'; // Default for local development
  }
  return SUPABASE_URL;
}

/**
 * Get the embeddings API endpoint
 */
export function getEmbeddingsEndpoint(): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/functions/v1/embeddings`;
}

/**
 * Get the transcribe API endpoint
 */
export function getTranscribeEndpoint(): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/functions/v1/transcribe`;
}

/**
 * Safe fetch wrapper with error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      
      // Try to parse JSON error
      try {
        const errorData = await response.json();
        
        // Handle different error response shapes from Edge Functions
        if (typeof errorData.error === 'string') {
          // Error is a string: { error: "message" }
          errorMessage = errorData.error;
        } else if (
          typeof errorData.error === 'object' &&
          errorData.error !== null &&
          'message' in errorData.error
        ) {
          // Error is an object: { error: { message: "text" } }
          errorMessage = errorData.error.message;
        } else if (typeof errorData.message === 'string') {
          // Fallback to message field: { message: "text" }
          errorMessage = errorData.message;
        }
      } catch {
        // Fall back to text if JSON parsing fails
        try {
          const textError = await response.text();
          errorMessage = textError || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }
      }

      throw new Error(`API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Fetch failed: ${String(error)}`);
  }
}
