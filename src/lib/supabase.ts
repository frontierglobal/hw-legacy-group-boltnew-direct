import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Use direct Supabase credentials as specified
const supabaseUrl = 'https://guyjytkicpevzceodmwk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1eWp5dGtpY3BldnpjZW9kbXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzE4MzksImV4cCI6MjA1Njk0NzgzOX0.y72nVTzR3Qa2MD6JQ1Sk8_aPpjfm_jf1RNRSAGW6S1Q';

// Log environment info (without sensitive data)
logger.info('Environment check:', {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  usingDirectSupabaseConfig: true
});

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__supabase_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    logger.warn('localStorage is not available:', e as Error);
    return false;
  }
};

// Initialize Supabase client
logger.info('Initializing Supabase client...');

const supabaseOptions = {
  auth: {
    persistSession: isLocalStorageAvailable(),
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    debug: import.meta.env.DEV
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Set up auth state change listener with enhanced logging
supabase.auth.onAuthStateChange((event, session) => {
  logger.info('Auth state changed:', { 
    event, 
    hasSession: !!session,
    userId: session?.user?.id
  });
});

// Enhanced helper functions
export const signIn = async (email: string, password: string) => {
  logger.debug('Attempting sign in...', { email });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign in error:', error);
    } else {
      logger.info('Sign in successful', { 
        userId: data.user?.id
      });
    }
    return { data, error };
  } catch (error) {
    logger.error('Unexpected error during sign in:', error as Error);
    throw error;
  }
};

export const signOut = async () => {
  logger.debug('Attempting sign out...');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Sign out error:', error);
    } else {
      logger.info('Sign out successful');
    }
    return { error };
  } catch (error) {
    logger.error('Unexpected error during sign out:', error as Error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  logger.debug('Getting current user...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      logger.error('Get user error:', error);
    } else {
      logger.info('Got current user:', { userId: user?.id });
    }
    return { user, error };
  } catch (error) {
    logger.error('Unexpected error getting current user:', error as Error);
    throw error;
  }
};

export const getCurrentSession = async () => {
  logger.debug('Getting current session...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('Get session error:', error);
    } else {
      logger.info('Got current session:', { 
        hasSession: !!session
      });
    }
    return { session, error };
  } catch (error) {
    logger.error('Unexpected error getting current session:', error as Error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  logger.debug('Attempting sign up...', { email });
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email,
          email_verified: false,
          phone_verified: false
        }
      }
    });

    if (error) {
      logger.error('Sign up error:', error);
    } else {
      logger.info('Sign up successful', { userId: data.user?.id });
    }
    return { data, error };
  } catch (error) {
    logger.error('Unexpected error during sign up:', error as Error);
    throw error;
  }
};

// Add logging for database operations
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  logger.debug(`Supabase query on table: ${table}`);
  const result = originalFrom.call(this, table);
  return result;
};
