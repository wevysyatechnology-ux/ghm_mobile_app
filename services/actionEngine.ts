import { supabase } from '@/lib/supabase';
import { fetchWithErrorHandling } from '@/lib/apiConfig';

const getClassifyIntentEndpoint = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/functions/v1/classify-intent`;
};

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

/**
 * 🎯 Action Engine
 * 
 * Classifies user intent and determines appropriate actions
 * Uses GPT to understand natural language and extract structured intents
 */
class ActionEngine {
  private actionMap: Map<string, any> = new Map();

  constructor() {
    this.initializeActions();
  }

  /**
   * Initialize available actions
   */
  private initializeActions(): void {
    // Member actions
    this.actionMap.set('search_member', {
      handler: this.searchMembers,
      screen: '/(tabs)/discover',
      description: 'Search for members by profession or location',
    });

    // Deal actions
    this.actionMap.set('post_deal', {
      handler: this.postDeal,
      screen: '/deals-form',
      description: 'Create and post a new business deal',
    });

    this.actionMap.set('view_deals', {
      handler: this.viewDeals,
      screen: '/(tabs)/activity',
      description: 'View all available deals',
    });

    // Link actions
    this.actionMap.set('send_link', {
      handler: this.sendLink,
      screen: '/links-form',
      description: 'Send a link request to connect people',
    });

    // i2we actions
    this.actionMap.set('create_i2we', {
      handler: this.createI2we,
      screen: '/i2we-form',
      description: 'Create an i2we connection request',
    });

    // Profile actions
    this.actionMap.set('view_profile', {
      handler: this.viewProfile,
      screen: '/(tabs)/profile',
      description: 'View your profile',
    });

    // Channel actions
    this.actionMap.set('view_channels', {
      handler: this.viewChannels,
      screen: '/channels',
      description: 'Browse available channels',
    });

    // Activity actions
    this.actionMap.set('view_activity', {
      handler: this.viewActivity,
      screen: '/(tabs)/activity',
      description: 'View recent activity',
    });
  }

  /**
   * Classify user intent using GPT via backend proxy
   * Returns structured intent with action parameters
   */
  async classifyIntent(query: string, context: string = ''): Promise<Intent> {
    try {
      console.log('🎯 Classifying intent for:', query);

      // Call backend proxy for intent classification
      const intentData = await fetchWithErrorHandling<any>(
        getClassifyIntentEndpoint(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            context,
          }),
        }
      );

      // Build structured intent
      const intent: Intent = {
        type: intentData.type || 'knowledge',
        category: intentData.category,
        response: intentData.response || 'I can help you with that.',
        confidence: intentData.confidence || 0.5,
      };

      // If it's an action, add action details
      if (intent.type === 'action' && intent.category) {
        const actionConfig = this.actionMap.get(intent.category);
        if (actionConfig) {
          intent.action = {
            name: intent.category,
            parameters: intentData.parameters || {},
            screen: actionConfig.screen,
          };
        }
      }

      console.log('✅ Intent classified:', intent.type, intent.category);
      return intent;
    } catch (error) {
      console.error('❌ Intent classification failed:', error);
      // Fallback to simple keyword matching
      return this.fallbackIntentClassification(query);
    }
  }

  /**
   * Fallback intent classification using keywords
   */
  private fallbackIntentClassification(query: string): Intent {
    const lowerQuery = query.toLowerCase();

    // Check for action keywords
    if (lowerQuery.includes('find') || lowerQuery.includes('search')) {
      return {
        type: 'action',
        category: 'search_member',
        action: {
          name: 'search_member',
          parameters: {},
          screen: '/(tabs)/discover',
        },
        response: 'Let me help you find someone in the network.',
        confidence: 0.7,
      };
    }

    if (lowerQuery.includes('deal')) {
      if (lowerQuery.includes('post') || lowerQuery.includes('create')) {
        return {
          type: 'action',
          category: 'post_deal',
          action: {
            name: 'post_deal',
            parameters: {},
            screen: '/deals-form',
          },
          response: 'Opening the deals form for you.',
          confidence: 0.7,
        };
      }
      return {
        type: 'action',
        category: 'view_deals',
        action: {
          name: 'view_deals',
          parameters: {},
          screen: '/(tabs)/activity',
        },
        response: 'Showing available deals.',
        confidence: 0.7,
      };
    }

    // Default to knowledge query
    return {
      type: 'knowledge',
      category: 'general',
      response: 'Let me look that up for you.',
      confidence: 0.5,
    };
  }

  /**
   * Execute an action
   */
  async executeAction(intent: Intent): Promise<any> {
    if (intent.type !== 'action' || !intent.action) {
      return null;
    }

    const actionConfig = this.actionMap.get(intent.action.name);
    if (!actionConfig) {
      console.error('❌ Unknown action:', intent.action.name);
      return null;
    }

    try {
      console.log('⚡ Executing action:', intent.action.name);
      return await actionConfig.handler.call(this, intent.action.parameters);
    } catch (error) {
      console.error('❌ Action execution failed:', error);
      throw error;
    }
  }

  /**
   * Action Handlers
   */

  private async searchMembers(params: any): Promise<any> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .limit(20);

      if (params.profession) {
        query = query.ilike('industry', `%${params.profession}%`);
      }

      if (params.location) {
        query = query.ilike('location', `%${params.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Found ${data?.length || 0} members`,
      };
    } catch (error) {
      console.error('❌ Search members failed:', error);
      return { success: false, error };
    }
  }

  private async postDeal(params: any): Promise<any> {
    // Navigation action - will be handled by UI
    return {
      success: true,
      navigation: true,
      screen: '/deals-form',
    };
  }

  private async viewDeals(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/(tabs)/activity',
    };
  }

  private async sendLink(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/links-form',
    };
  }

  private async createI2we(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/i2we-form',
    };
  }

  private async viewProfile(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/(tabs)/profile',
    };
  }

  private async viewChannels(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/channels',
    };
  }

  private async viewActivity(params: any): Promise<any> {
    return {
      success: true,
      navigation: true,
      screen: '/(tabs)/activity',
    };
  }

  /**
   * Get available actions
   */
  getAvailableActions(): Array<{ name: string; description: string }> {
    return Array.from(this.actionMap.entries()).map(([name, config]) => ({
      name,
      description: config.description,
    }));
  }
}

export const actionEngine = new ActionEngine();
