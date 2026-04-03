import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface AIConsentContextType {
  consentStatus: ConsentStatus;
  isConsentGranted: boolean;
  showModal: boolean;
  requestConsent: () => void;
  grantConsent: () => Promise<void>;
  denyConsent: () => Promise<void>;
}

const AIConsentContext = createContext<AIConsentContextType | undefined>(undefined);

export function AIConsentProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [showModal, setShowModal] = useState(false);

  // Re-fetch consent every time the logged-in user changes.
  // This ensures a new user on the same device gets the popup if they haven't consented.
  useEffect(() => {
    if (!userId) {
      setConsentStatus('pending');
      setShowModal(false);
      return;
    }

    supabase
      .from('users_profile')
      .select('ai_consent')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching AI consent:', error);
          setConsentStatus('pending');
          setShowModal(true);
          return;
        }
        const status: ConsentStatus =
          data?.ai_consent === 'accepted'
            ? 'accepted'
            : data?.ai_consent === 'declined'
            ? 'declined'
            : 'pending';
        setConsentStatus(status);
        // Show popup only when the user hasn't set a preference yet
        setShowModal(status === 'pending');
      });
  }, [userId]);

  const requestConsent = () => {
    if (consentStatus !== 'accepted') {
      setShowModal(true);
    }
  };

  const grantConsent = async () => {
    if (userId) {
      const { error } = await supabase
        .from('users_profile')
        .update({ ai_consent: 'accepted' })
        .eq('id', userId);
      if (error) {
        console.error('Error saving AI consent (grant):', error);
      }
    }
    setConsentStatus('accepted');
    setShowModal(false);
  };

  const denyConsent = async () => {
    if (userId) {
      const { error } = await supabase
        .from('users_profile')
        .update({ ai_consent: 'declined' })
        .eq('id', userId);
      if (error) {
        console.error('Error saving AI consent (deny):', error);
      }
    }
    setConsentStatus('declined');
    setShowModal(false);
  };

  return (
    <AIConsentContext.Provider
      value={{
        consentStatus,
        isConsentGranted: consentStatus === 'accepted',
        showModal,
        requestConsent,
        grantConsent,
        denyConsent,
      }}>
      {children}
    </AIConsentContext.Provider>
  );
}

export function useAIConsent() {
  const context = useContext(AIConsentContext);
  if (!context) {
    throw new Error('useAIConsent must be used within AIConsentProvider');
  }
  return context;
}
