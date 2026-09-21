import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, demoStore } from '../lib/supabase';
import { DEMO_PATIENT_PROFILE, DEMO_ADMIN_PROFILE } from '../lib/demoData';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignUpData) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { full_name: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  toggleDemoMode: (enable: boolean) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Is live Supabase ready vs using local demo mode?
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured());

  // Helper to fetch profile from Supabase
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('[AuthContext] Unexpected profile error:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured() && supabase && !isDemoMode) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!isMounted) return;

          setSession(data.session);
          setUser(data.session?.user ?? null);

          if (data.session?.user) {
            const p = await fetchProfile(data.session.user.id);
            if (isMounted) setProfile(p);
          }
        } catch (err) {
          console.error('[AuthContext] Init session error:', err);
        } finally {
          if (isMounted) setIsLoading(false);
        }

        // Listen for Supabase auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (!isMounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const p = await fetchProfile(newSession.user.id);
            if (isMounted) setProfile(p);
          } else {
            if (isMounted) setProfile(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Demo Mode Initialization
        const storedDemoUser = localStorage.getItem('medislot_active_demo_user');
        if (storedDemoUser) {
          try {
            const p = JSON.parse(storedDemoUser) as Profile;
            setProfile(p);
            // Construct a lightweight synthetic user object matching Supabase User shape
            setUser({
              id: p.id,
              email: p.role === 'admin' ? 'admin@medislot.health' : 'patient@example.com',
              user_metadata: { full_name: p.full_name },
              app_metadata: {},
              aud: 'authenticated',
              created_at: p.created_at,
            } as User);
          } catch {
            // invalid stored data
          }
        }
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchProfile, isDemoMode]);

  // Email & password Login
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          const p = await fetchProfile(data.user.id);
          setProfile(p);
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
        return { success: false, error: message };
      }
    } else {
      // Demo Mode login fallback
      // If email has 'admin', treat as admin; otherwise patient
      const isAdminLogin = email.toLowerCase().includes('admin');
      const targetProfile = isAdminLogin ? DEMO_ADMIN_PROFILE : DEMO_PATIENT_PROFILE;

      setProfile(targetProfile);
      setUser({
        id: targetProfile.id,
        email: email.trim(),
        user_metadata: { full_name: targetProfile.full_name },
        app_metadata: {},
        aud: 'authenticated',
        created_at: targetProfile.created_at,
      } as User);

      localStorage.setItem('medislot_active_demo_user', JSON.stringify(targetProfile));
      setIsLoading(false);
      return { success: true };
    }
  };

  // Sign up
  const signup = async (
    data: SignUpData
  ): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              phone: data.phone.trim(),
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        const requiresConfirmation = Boolean(
          authData.user && !authData.session
        );

        if (authData.session && authData.user) {
          setUser(authData.user);
          setSession(authData.session);
          const p = await fetchProfile(authData.user.id);
          setProfile(p);
        }

        setIsLoading(false);
        return { success: true, requiresEmailConfirmation: requiresConfirmation };
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        return { success: false, error: message };
      }
    } else {
      // Demo Mode signup
      const newProfile: Profile = {
        id: `patient-user-${Date.now()}`,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        role: 'patient', // Enforce patient role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      demoStore.updateProfile(newProfile.id, newProfile);
      setProfile(newProfile);
      setUser({
        id: newProfile.id,
        email: data.email.trim(),
        user_metadata: { full_name: newProfile.full_name },
        app_metadata: {},
        aud: 'authenticated',
        created_at: newProfile.created_at,
      } as User);

      localStorage.setItem('medislot_active_demo_user', JSON.stringify(newProfile));
      setIsLoading(false);
      return { success: true, requiresEmailConfirmation: false };
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('medislot_active_demo_user');
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  // Direct profile update
  const updateProfile = async (
    data: { full_name: string; phone: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'No active profile found' };

    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) return { success: false, error: error.message };

      setProfile({
        ...profile,
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
      });
      return { success: true };
    } else {
      const updated = demoStore.updateProfile(profile.id, {
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
      });
      setProfile(updated);
      localStorage.setItem('medislot_active_demo_user', JSON.stringify(updated));
      return { success: true };
    }
  };

  // Quick Demo Account Switcher (For testing or YouTube video demonstration)
  const loginAsDemo = (role: UserRole) => {
    const target = role === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_PATIENT_PROFILE;
    setProfile(target);
    setUser({
      id: target.id,
      email: role === 'admin' ? 'admin@medislot.health' : 'alex.johnson@example.com',
      user_metadata: { full_name: target.full_name },
      app_metadata: {},
      aud: 'authenticated',
      created_at: target.created_at,
    } as User);
    localStorage.setItem('medislot_active_demo_user', JSON.stringify(target));
  };

  const toggleDemoMode = (enable: boolean) => {
    setIsDemoMode(enable);
    if (enable) {
      loginAsDemo('patient');
    } else {
      logout();
    }
  };

  const refreshProfile = async () => {
    if (user && supabase && !isDemoMode) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        isLoading,
        isDemoMode,
        login,
        signup,
        logout,
        updateProfile,
        loginAsDemo,
        toggleDemoMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
