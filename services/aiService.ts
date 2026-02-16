import type { AIIntent } from '@/types';
import { speechService } from './speechService';

export class AIService {
  /**
   * Process voice input and return AI intent
   */
  static async processVoiceInput(transcript: string): Promise<AIIntent> {
    // Process the transcript the same way as text input
    return this.processTextInput(transcript);
  }

  /**
   * Process text input with comprehensive intent recognition
   */
  static async processTextInput(text: string): Promise<AIIntent> {
    const lowerText = text.toLowerCase().trim();

    // Find/Search members
    if (this.matchesKeywords(lowerText, ['find', 'search', 'looking for', 'locate', 'discover'])) {
      if (this.matchesKeywords(lowerText, ['ca', 'chartered accountant', 'accountant'])) {
        return {
          intent: 'find_member',
          screen_to_open: '/(tabs)/discover',
          message: 'Let me find CAs for you in the network',
          data: { category: 'CA' },
          shouldSpeak: true,
        };
      }
      if (this.matchesKeywords(lowerText, ['lawyer', 'advocate', 'legal'])) {
        return {
          intent: 'find_member',
          screen_to_open: '/(tabs)/discover',
          message: 'Searching for lawyers in the WeVysya network',
          data: { category: 'Lawyer' },
          shouldSpeak: true,
        };
      }
      return {
        intent: 'find_member',
        screen_to_open: '/(tabs)/discover',
        message: 'Let me help you find the right person in our network',
        shouldSpeak: true,
      };
    }

    // Deals
    if (this.matchesKeywords(lowerText, ['deal', 'opportunity', 'business'])) {
      if (this.matchesKeywords(lowerText, ['post', 'create', 'add', 'new', 'share'])) {
        return {
          intent: 'post_deal',
          screen_to_open: '/deals-form',
          message: 'Opening the deals form. Let me help you share this opportunity!',
          shouldSpeak: true,
        };
      }
      return {
        intent: 'view_deals',
        screen_to_open: '/(tabs)/activity',
        message: 'Showing all available deals',
        shouldSpeak: true,
      };
    }

    // Links
    if (this.matchesKeywords(lowerText, ['link', 'connection', 'introduce', 'introduction'])) {
      if (this.matchesKeywords(lowerText, ['send', 'create', 'post', 'share', 'new'])) {
        return {
          intent: 'send_link',
          screen_to_open: '/links-form',
          message: 'Let me help you create a new link!',
          shouldSpeak: true,
        };
      }
      return {
        intent: 'view_links',
        screen_to_open: '/(tabs)/activity',
        message: 'Here are your active links',
        shouldSpeak: true,
      };
    }

    // i2we / Connect
    if (this.matchesKeywords(lowerText, ['i2we', 'i to we', 'connect', 'introduce me'])) {
      return {
        intent: 'i2we',
        screen_to_open: '/i2we-form',
        message: 'Opening i2we connection form. Stop thinking "I", start thinking "WE"!',
        shouldSpeak: true,
      };
    }

    // Call/Contact
    if (this.matchesKeywords(lowerText, ['call', 'contact', 'phone', 'reach out'])) {
      return {
        intent: 'initiate_call',
        screen_to_open: '/(tabs)/discover',
        message: 'Who would you like to call? Let me help you connect',
        shouldSpeak: true,
      };
    }

    // Profile
    if (this.matchesKeywords(lowerText, ['profile', 'my account', 'my info', 'my details'])) {
      return {
        intent: 'view_profile',
        screen_to_open: '/(tabs)/profile',
        message: 'Opening your profile',
        shouldSpeak: true,
      };
    }

    // Channels
    if (this.matchesKeywords(lowerText, ['channel', 'group', 'community', 'forum'])) {
      return {
        intent: 'view_channels',
        screen_to_open: '/channels',
        message: 'Here are all the channels available',
        shouldSpeak: true,
      };
    }

    // Activity
    if (this.matchesKeywords(lowerText, ['activity', 'recent', 'history', 'updates'])) {
      return {
        intent: 'view_activity',
        screen_to_open: '/(tabs)/activity',
        message: 'Showing your recent activity',
        shouldSpeak: true,
      };
    }

    // Greetings
    if (this.matchesKeywords(lowerText, ['hello', 'hi', 'hey', 'greetings'])) {
      return {
        intent: 'general',
        screen_to_open: null,
        message: 'Hello! I\'m WeVysya Assistant. How can I help you today?',
        shouldSpeak: true,
      };
    }

    // Help
    if (this.matchesKeywords(lowerText, ['help', 'what can you do', 'assist', 'support'])) {
      return {
        intent: 'general',
        screen_to_open: null,
        message: 'I can help you find members, post deals and links, connect people through i2we, and much more. Just tell me what you need!',
        shouldSpeak: true,
      };
    }

    // Default response
    return {
      intent: 'general',
      screen_to_open: null,
      message: "I'm here to help! You can ask me to find members, post deals, create links, or connect people. What would you like to do?",
      shouldSpeak: true,
    };
  }

  /**
   * Process quick prompt chips
   */
  static async processPrompt(prompt: string): Promise<AIIntent> {
    return this.processTextInput(prompt);
  }

  /**
   * Speak the AI response
   */
  static async speakResponse(message: string): Promise<void> {
    try {
      await speechService.speak(message, {
        rate: 0.95,
        pitch: 1.0,
        language: 'en-US',
      });
    } catch (error) {
      console.error('Error speaking response:', error);
    }
  }

  /**
   * Check if text matches any of the keywords
   */
  private static matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Extract entities from text (simple implementation)
   */
  private static extractEntities(text: string): { category?: string; location?: string } {
    const entities: { category?: string; location?: string } = {};
    
    const lowerText = text.toLowerCase();
    
    // Extract category
    if (lowerText.includes('ca') || lowerText.includes('chartered account')) {
      entities.category = 'CA';
    } else if (lowerText.includes('lawyer') || lowerText.includes('advocate')) {
      entities.category = 'Lawyer';
    } else if (lowerText.includes('doctor') || lowerText.includes('physician')) {
      entities.category = 'Doctor';
    }
    
    // Extract location (simple examples)
    if (lowerText.includes('bangalore') || lowerText.includes('bengaluru')) {
      entities.location = 'Bengaluru';
    } else if (lowerText.includes('mumbai')) {
      entities.location = 'Mumbai';
    } else if (lowerText.includes('delhi')) {
      entities.location = 'Delhi';
    }
    
    return entities;
  }
}
