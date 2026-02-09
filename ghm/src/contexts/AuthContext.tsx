import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import type { UserProfile } from '../types/database';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  hasAdminAccess: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setHasAdminAccess(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const { hasAccess, profile: userProfile } = await authService.checkAdminAccess(userId);
      setProfile(userProfile);
      setHasAdminAccess(hasAccess);
    } catch (error) {
      console.error('Error loading profile:', error);
      setHasAdminAccess(false);
    }
  }

  async function signIn(email: string, password: string) {
    const data = await authService.signIn(email, password);
    if (data.user) {
      setUser(data.user);
      await loadUserProfile(data.user.id);
    }
  }

  async function signOut() {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setHasAdminAccess(false);
  }

  return (
    <AuthContext.Provider value={{ user, profile, hasAdminAccess, loading, signIn, signOut }}>
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
