import type { AIIntent } from '@/types';

export class AIService {
  static async processVoiceInput(audioData: any): Promise<AIIntent> {
    await this.simulateDelay(1000);

    return {
      intent: 'find_member',
      screen_to_open: '/(tabs)/discover',
      message: 'Here are some CAs in Bengaluru',
      data: { category: 'CA', location: 'Bengaluru' },
    };
  }

  static async processTextInput(text: string): Promise<AIIntent> {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('find') || lowerText.includes('search')) {
      return {
        intent: 'find_member',
        screen_to_open: '/(tabs)/discover',
        message: 'Let me help you find the right person',
      };
    }

    if (lowerText.includes('deal')) {
      return {
        intent: 'post_deal',
        screen_to_open: '/(tabs)/activity',
        message: 'Opening deals section',
      };
    }

    if (lowerText.includes('call')) {
      return {
        intent: 'initiate_call',
        screen_to_open: '/(tabs)/discover',
        message: 'Who would you like to call?',
      };
    }

    if (lowerText.includes('profile')) {
      return {
        intent: 'view_profile',
        screen_to_open: '/(tabs)/profile',
        message: 'Opening your profile',
      };
    }

    return {
      intent: 'general',
      screen_to_open: '/(tabs)',
      message: "I'm here to help! What would you like to do?",
    };
  }

  static async processPrompt(prompt: string): Promise<AIIntent> {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('find')) {
      return {
        intent: 'find_member',
        screen_to_open: '/(tabs)/discover',
        message: 'Searching for members...',
      };
    }

    if (lowerPrompt.includes('deal')) {
      return {
        intent: 'post_deal',
        screen_to_open: '/(tabs)/activity',
        message: 'Ready to post a deal',
      };
    }

    if (lowerPrompt.includes('invite') || lowerPrompt.includes('visitor')) {
      return {
        intent: 'invite_visitor',
        screen_to_open: '/(tabs)/activity',
        message: 'Opening visitor invite',
      };
    }

    if (lowerPrompt.includes('call')) {
      return {
        intent: 'initiate_call',
        screen_to_open: '/(tabs)/discover',
        message: 'Select a member to call',
      };
    }

    return {
      intent: 'general',
      screen_to_open: '/(tabs)',
      message: 'How can I help you?',
    };
  }

  private static simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
