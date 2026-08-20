import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { authService } from '../services/authService';
import { ROLES, normalizeRole } from '../constants/roles';

const defaultAuthContextValue = {
  session: null,
  user: null,
  profile: null,
  role: null,
  hodDepartment: null,
  loading: true,
  authError: null,
  logout: async () => {},
  refreshAuth: async () => {},
};

export const AuthContext = createContext(defaultAuthContextValue);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [hodDepartment, setHodDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const syncUserState = async (currentSession) => {
    try {
      setLoading(true);
      setAuthError(null);
      setSession(currentSession);

      if (currentSession?.user) {
        setUser(currentSession.user);
        const userId = currentSession.user.id;

        // Fetch DB profile from public.users
        const dbProfile = await authService.fetchUserProfile(userId);

        if (dbProfile && dbProfile.role) {
          const userRole = normalizeRole(dbProfile.role);
          setRole(userRole);
          setProfile(dbProfile);

          // If role is HOD, dynamically resolve department_id
          if (userRole === 'hod') {
            const dept = await authService.fetchHodDepartment(userId);
            setHodDepartment(dept);
          } else {
            setHodDepartment(null);
          }
        } else {
          // Check session user_metadata as secondary role source if public.users row is pending
          const metadataRole = normalizeRole(currentSession.user.user_metadata?.role);
          if (metadataRole) {
            setRole(metadataRole);
            setProfile({
              id: userId,
              email: currentSession.user.email,
              full_name: currentSession.user.user_metadata?.full_name || 'User',
              role: metadataRole,
              status: 'Active',
            });
          } else {
            // Profile or role missing completely - DO NOT default to student
            setRole(null);
            setProfile(null);
            setAuthError('User role could not be resolved from database.');
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        setHodDepartment(null);
      }
    } catch (err) {
      console.error('Error synchronizing auth state:', err);
      setAuthError(err.message);
      setUser(null);
      setProfile(null);
      setRole(null);
      setHodDepartment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch initial session
    authService.getCurrentSession()
      .then((initialSession) => {
        syncUserState(initialSession);
      })
      .catch((err) => {
        console.error('Failed to retrieve session:', err);
        setLoading(false);
      });

    // 2. Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      syncUserState(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setHodDepartment(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role,
      hodDepartment,
      loading,
      authError,
      logout,
      refreshAuth: () => authService.getCurrentSession().then(syncUserState),
    }),
    [session, user, profile, role, hodDepartment, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContextValue;
};
