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
  response: string; // The text spoken back to the user
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

    // Database query actions
    this.actionMap.set('query_house_members', {
      handler: this.queryHouseMembers,
      description: 'Query the database for the number of members in the user\'s house',
    });
  }

  /**
   * Classify user intent using GPT via backend proxy
   * Returns structured intent with action parameters
   */
  async classifyIntent(query: string, context: string = ''): Promise<Intent> {
    try {
      console.log('🎯 Classifying intent for:', query);

      // Get Supabase anon key for authorization
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      // Call backend proxy for intent classification
      const intentData = await fetchWithErrorHandling<any>(
        getClassifyIntentEndpoint(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
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

      console.log('✅ Intent classified from backend:', intent.type, intent.category);
      return intent;
    } catch (error) {
      console.error('❌ Intent classification failed:', error);
      // Fallback to simple keyword matching
      return this.fallbackIntentClassification(query);
    }
  }

  /**
   * Ultra-fast local intent classification using regex/keywords
   * Bypasses OpenAI completely for common commands
   */
  fastLocalClassification(query: string): Intent | null {
    const lowerQuery = query.toLowerCase();

    // 1. Profile actions
    if (/show.*profile|open.*profile|my.*profile|view.*profile/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'view_profile',
        action: { name: 'view_profile', parameters: {}, screen: '/(tabs)/profile' },
        response: 'Opening your profile.',
        confidence: 0.95,
      };
    }

    // 2. Deals actions
    if (/post.*deal|create.*deal|add.*deal/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'post_deal',
        action: { name: 'post_deal', parameters: {}, screen: '/deals-form' },
        response: 'Opening the deal creation form.',
        confidence: 0.95,
      };
    }
    if (/show.*deals|view.*deals|open.*deals/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'view_deals',
        action: { name: 'view_deals', parameters: {}, screen: '/(tabs)/activity' },
        response: 'Showing the latest deals.',
        confidence: 0.95,
      };
    }

    // 3. Activity / Home actions
    if (/show.*activity|view.*activity|open.*activity/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'view_activity',
        action: { name: 'view_activity', parameters: {}, screen: '/(tabs)/activity' },
        response: 'Opening your recent activity.',
        confidence: 0.95,
      };
    }

    // 4. House members query
    if (/how many.*members.*(my|in).*house|members.*in.*my.*house/.test(lowerQuery)) {
      return {
        type: 'action', // using action to trigger our logic
        category: 'query_house_members',
        action: { name: 'query_house_members', parameters: {} },
        response: 'Let me check the database for your house members.',
        confidence: 0.95,
      };
    }

    // 5. Connect / Link actions
    if (/send.*link|give.*link|create.*link/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'send_link',
        action: { name: 'send_link', parameters: {}, screen: '/links-form' },
        response: 'Opening the link request form.',
        confidence: 0.90,
      };
    }
    if (/create.*i2we|start.*i2we/.test(lowerQuery)) {
      return {
        type: 'action',
        category: 'create_i2we',
        action: { name: 'create_i2we', parameters: {}, screen: '/i2we-form' },
        response: 'Opening the i2we creation form.',
        confidence: 0.90,
      };
    }

    // 6. Generic search (we let the backend handle complex role/city searches, but catch basic ones)
    if (/search.*member|find.*member/.test(lowerQuery) && lowerQuery.length < 25) {
      return {
        type: 'action',
        category: 'search_member',
        action: { name: 'search_member', parameters: {}, screen: '/(tabs)/discover' },
        response: 'Taking you to member search.',
        confidence: 0.8,
      };
    }

    return null; // No high-confidence local match, try backend
  }

  /**
   * Safe fallback intent classification using keywords if backend fails
   */
  private fallbackIntentClassification(query: string): Intent {
    const localMatch = this.fastLocalClassification(query);
    if (localMatch) return localMatch;
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
        .from('users_profile')
        .select('id, full_name, business_category, city, phone_number')
        .limit(20);

      if (params.profession) {
        query = query.ilike('business_category', `%${params.profession}%`);
      }

      if (params.location) {
        query = query.ilike('city', `%${params.location}%`);
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

  /**
   * Database Query Actions
   */
  private async queryHouseMembers(params: any): Promise<any> {
    try {
      // 1. First we need to get the current user's profile to find their house_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          spokenResponse: "I cannot check house members. You are not logged in."
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('house_id, house_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          spokenResponse: "I couldn't find your profile information to look up your house."
        };
      }

      const houseId = profile.house_id;
      const houseName = profile.house_name || 'your house';

      if (!houseId) {
        return {
          success: false,
          spokenResponse: "You don't appear to be assigned to a house yet."
        };
      }

      // 2. Query the database for the exact count of members with this house_id
      const { count, error: countError } = await supabase
        .from('users_profile')
        .select('*', { count: 'exact', head: true })
        .eq('house_id', houseId);

      if (countError) {
        return {
          success: false,
          spokenResponse: "Sorry, I had trouble counting the members in your house."
        };
      }

      const memberCount = count || 0;

      return {
        success: true,
        // Override the spoken response with the dynamic data result
        spokenResponse: `There are ${memberCount} members currently registered in ${houseName}.`,
      };
    } catch (error) {
      console.error('❌ Query house members failed:', error);
      return { success: false, spokenResponse: "I encountered an error while safely checking the database." };
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
