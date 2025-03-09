import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    logger.info('Setting up auth subscription...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed:', { event, hasSession: !!session });
      
      if (session?.user) {
        try {
          // Get user role from user_roles table
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', session.user.id)
            .single();

          if (roleError) {
            logger.error('Error fetching user role:', roleError);
            throw roleError;
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: roleData?.roles?.name || 'user'
          });
        } catch (error) {
          logger.error('Error setting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Attempting sign in...', { email });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        logger.error('Sign in error:', error);
        throw error;
      }

      logger.info('Sign in successful');
      navigate('/dashboard');
    } catch (error) {
      logger.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      logger.info('Attempting sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out error:', error);
        throw error;
      }

      logger.info('Sign out successful');
      navigate('/');
    } catch (error) {
      logger.error('Sign out failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 