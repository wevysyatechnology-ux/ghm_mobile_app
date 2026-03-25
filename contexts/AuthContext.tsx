import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authService } from '@/services/authService';
import { UserProfile, CoreMembership, VirtualMembership } from '@/types/database';
import { User } from '@supabase/supabase-js';
import { colors } from '@/constants/theme';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  profile: UserProfile | null;
  coreMembership: CoreMembership | null;
  virtualMembership: VirtualMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  blockedStatus: string | null;
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
  const [blockedStatus, setBlockedStatus] = useState<string | null>(null);

  console.log('🔐 AuthProvider initialized');

  const isProfileComplete = Boolean(
    profile && profile.full_name && profile.full_name !== null && profile.full_name.trim().length > 0
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
      console.log('🔄 AuthContext - loadUserData for uid:', uid);
      const userProfile = await authService.getUserProfile(uid);
      console.log('🔄 AuthContext - loaded profile:', userProfile);
      setProfile(userProfile);

      if (userProfile) {
        // Check membership_status directly from profile (profiles table)
        const status = userProfile.membership_status;
        if (status && status !== 'active') {
          console.warn(`⛔ Membership status is '${status}' — blocking access`);
          setBlockedStatus(status);
          return;
        } else {
          setBlockedStatus(null);
        }

        const membershipInfo = await authService.getMembershipInfo(uid);
        console.log('🔄 AuthContext - membership info:', membershipInfo);
        setCoreMembership(membershipInfo.coreMembership);
        setVirtualMembership(membershipInfo.virtualMembership);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  const refreshProfile = async () => {
    if (userId) {
      await loadUserData(userId);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserId(null);
      setProfile(null);
      setCoreMembership(null);
      setVirtualMembership(null);
      setBlockedStatus(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        blockedStatus,
        refreshProfile,
        signOut,
      }}>
      {blockedStatus ? (
        <View style={blockedStyles.container}>
          <View style={blockedStyles.card}>
            <Text style={blockedStyles.icon}>⛔</Text>
            <Text style={blockedStyles.title}>Account Access Restricted</Text>
            <Text style={blockedStyles.statusBadge}>
              {blockedStatus.charAt(0).toUpperCase() + blockedStatus.slice(1)}
            </Text>
            <Text style={blockedStyles.message}>
              Your membership has been marked as{' '}
              <Text style={blockedStyles.statusInline}>{blockedStatus}</Text>.
              {`\n\n`}Please contact your administrator to restore access.
            </Text>
            <TouchableOpacity style={blockedStyles.signOutBtn} onPress={signOut}>
              <Text style={blockedStyles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

const blockedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(22, 33, 28, 0.98)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    width: '100%',
    maxWidth: 360,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text_muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  statusInline: {
    color: '#ef4444',
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'capitalize',
  },
  signOutBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  signOutText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
