import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processSessionId = async (sessionId: string) => {
    try {
      const userData = await api.exchangeSession(sessionId);
      if (userData && userData.user_id) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.error('Session exchange error:', error);
    }
    return false;
  };

  const extractSessionId = (url: string): string | null => {
    if (!url) return null;
    
    // Check hash fragment
    const hashMatch = url.match(/#session_id=([^&]+)/);
    if (hashMatch) return hashMatch[1];
    
    // Check query params
    const queryMatch = url.match(/[?&]session_id=([^&]+)/);
    if (queryMatch) return queryMatch[1];
    
    return null;
  };

  const checkAuth = async () => {
    try {
      // Check for stored user first
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        
        // Verify session is still valid
        try {
          const me = await api.getMe();
          if (me) {
            setUser(me);
            await AsyncStorage.setItem('user', JSON.stringify(me));
          }
        } catch {
          // Session expired
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      }
      
      // Check for session_id in URL (web)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        const sessionId = extractSessionId(hash || window.location.href);
        if (sessionId) {
          await processSessionId(sessionId);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      
      // Check cold start URL (mobile)
      if (Platform.OS !== 'web') {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const sessionId = extractSessionId(initialUrl);
          if (sessionId) {
            await processSessionId(sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for URL changes (mobile)
    if (Platform.OS !== 'web') {
      const subscription = Linking.addEventListener('url', async (event) => {
        const sessionId = extractSessionId(event.url);
        if (sessionId) {
          setIsLoading(true);
          await processSessionId(sessionId);
          setIsLoading(false);
        }
      });
      
      return () => subscription.remove();
    }
  }, []);

  const login = async () => {
    const redirectUrl = Platform.OS === 'web'
      ? `${BACKEND_URL}/`
      : Linking.createURL('/');
    
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    
    if (Platform.OS === 'web') {
      window.location.href = authUrl;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const sessionId = extractSessionId(result.url);
        if (sessionId) {
          setIsLoading(true);
          await processSessionId(sessionId);
          setIsLoading(false);
        }
      }
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('user');
    }
  };

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      if (me) {
        setUser(me);
        await AsyncStorage.setItem('user', JSON.stringify(me));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
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
