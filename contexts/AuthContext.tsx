import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { UserProfile, CoreMembership, VirtualMembership } from '@/types/database';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  profile: UserProfile | null;
  coreMembership: CoreMembership | null;
  virtualMembership: VirtualMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coreMembership, setCoreMembership] = useState<CoreMembership | null>(null);
  const [virtualMembership, setVirtualMembership] = useState<VirtualMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider initialized');

  const isProfileComplete = Boolean(
    profile &&
      profile.full_name &&
      profile.business_category &&
      profile.country &&
      profile.state &&
      profile.city
  );

  console.log('AuthContext - isProfileComplete:', isProfileComplete, 'profile:', {
    hasProfile: !!profile,
    full_name: profile?.full_name,
    business_category: profile?.business_category,
    country: profile?.country,
    state: profile?.state,
    city: profile?.city,
  });

  const loadUserData = async (uid: string) => {
    try {
      console.log('AuthContext - loadUserData for uid:', uid);
      const userProfile = await authService.getUserProfile(uid);
      console.log('AuthContext - loaded profile:', userProfile);
      setProfile(userProfile);

      if (userProfile) {
        const membershipInfo = await authService.getMembershipInfo(uid);
        console.log('AuthContext - membership info:', membershipInfo);
        setCoreMembership(membershipInfo.coreMembership);
        setVirtualMembership(membershipInfo.virtualMembership);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshProfile = async () => {
    if (userId) {
      await loadUserData(userId);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUserId(null);
    setProfile(null);
    setCoreMembership(null);
    setVirtualMembership(null);
  };

  useEffect(() => {
    console.log('🔐 Setting up auth listener');

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⏱️ Auth initialization timeout - setting isLoading to false');
        setIsLoading(false);
      }
    }, 5000);

    try {
      const { data: authListener } = authService.onAuthStateChange((uid, authUser) => {
        (async () => {
          try {
            console.log('🔄 Auth state changed, uid:', uid);
            clearTimeout(timeoutId);
            setUser(authUser);
            setUserId(uid);

            if (uid) {
              await loadUserData(uid);
            } else {
              setProfile(null);
              setCoreMembership(null);
              setVirtualMembership(null);
            }

            setIsLoading(false);
          } catch (error) {
            console.error('❌ Error in auth state change handler:', error);
            setIsLoading(false);
          }
        })();
      });

      return () => {
        clearTimeout(timeoutId);
        authListener.subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        profile,
        coreMembership,
        virtualMembership,
        isLoading,
        isAuthenticated: !!userId,
        isProfileComplete,
        refreshProfile,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
