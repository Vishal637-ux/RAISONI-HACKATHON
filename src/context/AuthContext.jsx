import React, { createContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize state with Supabase session and user profile
  const syncUserState = async (currentSession) => {
    try {
      setSession(currentSession);

      if (currentSession?.user) {
        setUser(currentSession.user);
        const sessionRole = currentSession.user.user_metadata?.role?.toLowerCase();

        try {
          const userProfile = await authService.fetchUserProfile(currentSession.user.id);
          // Priority to session user_metadata role for login stability
          const activeRole = sessionRole || userProfile?.role?.toLowerCase() || 'student';

          setRole(activeRole);
          setProfile(userProfile || {
            id: currentSession.user.id,
            email: currentSession.user.email,
            full_name: currentSession.user.user_metadata?.full_name || 'Active User',
            role: activeRole,
            phone: '+91 98765 43210',
            status: 'Active',
          });
        } catch {
          const fallbackRole = sessionRole || 'student';
          setRole(fallbackRole);
          setProfile({
            id: currentSession.user.id,
            email: currentSession.user.email,
            full_name: currentSession.user.user_metadata?.full_name || 'Active User',
            role: fallbackRole,
            phone: '+91 98765 43210',
            status: 'Active',
          });
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
    } catch (error) {
      console.error('Error syncing auth user state:', error);
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authService.getCurrentSession().then((initialSession) => {
      syncUserState(initialSession);
    });

    const handleCustomAuthChange = () => {
      authService.getCurrentSession().then((currentSession) => {
        syncUserState(currentSession);
      });
    };

    window.addEventListener('custom-auth-change', handleCustomAuthChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        localStorage.removeItem('custom_auth_session');
      }
      syncUserState(newSession);
    });

    return () => {
      window.removeEventListener('custom-auth-change', handleCustomAuthChange);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.warn('Logout notice:', error);
    } finally {
      localStorage.removeItem('custom_auth_session');
      localStorage.removeItem('demo_active_role');
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role,
      logout,
      loading,
    }),
    [session, user, profile, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
