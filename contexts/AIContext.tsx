import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import type { AIIntent } from '@/types';

interface AIContextType {
  currentIntent: AIIntent | null;
  processIntent: (intent: AIIntent) => void;
  clearIntent: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [currentIntent, setCurrentIntent] = useState<AIIntent | null>(null);
  const router = useRouter();

  const processIntent = (intent: AIIntent) => {
    setCurrentIntent(intent);

    if (intent.screen_to_open) {
      router.push(intent.screen_to_open as any);
    }
  };

  const clearIntent = () => {
    setCurrentIntent(null);
  };

  return (
    <AIContext.Provider value={{ currentIntent, processIntent, clearIntent }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}
