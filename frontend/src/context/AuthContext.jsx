import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseAvailable } from '../lib/supabaseClient';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

const DEMO_ACCOUNTS = {
  patient: {
    id: 'patient-101',
    email: 'sarah.jenkins@example.com',
    role: 'patient',
    full_name: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    token: 'demo-token-patient'
  },
  doctor: {
    id: 'doctor-201',
    email: 'dr.marcus.vance@example.com',
    role: 'doctor',
    full_name: 'Dr. Marcus Vance, MD',
    phone: '+1 (555) 876-5432',
    token: 'demo-token-doctor'
  },
  admin: {
    id: 'admin-001',
    email: 'admin@medicore.health',
    role: 'admin',
    full_name: 'System Administrator (Chief of Security)',
    phone: '+1 (555) 000-1122',
    token: 'demo-token-admin'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem('medicore_auth_token');
        const savedUserStr = localStorage.getItem('medicore_user');

        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
        } else {
          // Default to demo patient for convenient preview
          const defaultDemo = DEMO_ACCOUNTS.patient;
          setUser(defaultDemo);
          setToken(defaultDemo.token);
          localStorage.setItem('medicore_auth_token', defaultDemo.token);
          localStorage.setItem('medicore_user', JSON.stringify(defaultDemo));
        }

        // If live Supabase is configured, listen to real auth changes
        if (isLiveSupabaseAvailable && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setToken(session.access_token);
            localStorage.setItem('medicore_auth_token', session.access_token);
            const meRes = await authApi.getMe().catch(() => null);
            if (meRes?.user) {
              setUser(meRes.user);
              localStorage.setItem('medicore_user', JSON.stringify(meRes.user));
            }
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
              setToken(session.access_token);
              localStorage.setItem('medicore_auth_token', session.access_token);
              const meRes = await authApi.getMe().catch(() => null);
              if (meRes?.user) {
                setUser(meRes.user);
                localStorage.setItem('medicore_user', JSON.stringify(meRes.user));
              }
            } else if (event === 'SIGNED_OUT') {
              logout();
            }
          });

          return () => subscription.unsubscribe();
        }
      } catch (err) {
        console.error('[Auth Init Error]', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password, desiredRole = 'patient') => {
    // If live Supabase is available, attempt real authentication
    if (isLiveSupabaseAvailable && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setToken(data.session.access_token);
      localStorage.setItem('medicore_auth_token', data.session.access_token);

      const meData = await authApi.getMe();
      const loadedUser = meData.user;
      setUser(loadedUser);
      localStorage.setItem('medicore_user', JSON.stringify(loadedUser));
      return loadedUser;
    }

    // Demo Mode Simulation
    const targetDemo = DEMO_ACCOUNTS[desiredRole] || DEMO_ACCOUNTS.patient;
    const demoUser = {
      ...targetDemo,
      email: email || targetDemo.email
    };

    setUser(demoUser);
    setToken(demoUser.token);
    localStorage.setItem('medicore_auth_token', demoUser.token);
    localStorage.setItem('medicore_user', JSON.stringify(demoUser));
    return demoUser;
  };

  const register = async ({ email, password, fullName, role, ...extraDetails }) => {
    if (isLiveSupabaseAvailable && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        setToken(data.session.access_token);
        localStorage.setItem('medicore_auth_token', data.session.access_token);

        // Sync to profiles table via backend
        await authApi.sync({
          id: data.user.id,
          role,
          full_name: fullName,
          ...extraDetails
        });

        const meData = await authApi.getMe();
        setUser(meData.user);
        localStorage.setItem('medicore_user', JSON.stringify(meData.user));
        return meData.user;
      }
    }

    // Demo Mode registration
    const newDemoUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      email,
      role,
      full_name: fullName,
      phone: extraDetails.phone || '+1 (555) 000-9999',
      token: `demo-token-${role}`
    };

    // Sync to backend mock store
    await authApi.sync({
      id: newDemoUser.id,
      role,
      full_name: fullName,
      ...extraDetails
    }).catch(console.warn);

    setUser(newDemoUser);
    setToken(newDemoUser.token);
    localStorage.setItem('medicore_auth_token', newDemoUser.token);
    localStorage.setItem('medicore_user', JSON.stringify(newDemoUser));
    return newDemoUser;
  };

  const switchDemoRole = (roleKey) => {
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      setUser(demo);
      setToken(demo.token);
      localStorage.setItem('medicore_auth_token', demo.token);
      localStorage.setItem('medicore_user', JSON.stringify(demo));
    }
  };

  const logout = async () => {
    if (isLiveSupabaseAvailable && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('medicore_auth_token');
    localStorage.removeItem('medicore_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
