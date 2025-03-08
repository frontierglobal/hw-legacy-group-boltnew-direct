import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isProd = import.meta.env.PROD;
const productionUrl = import.meta.env.VITE_PRODUCTION_URL || 'https://hw-legacy-group-boltnew-direct-6sngrc6ty.vercel.app';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const storage = isLocalStorageAvailable() ? localStorage : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !!storage,
    storageKey: 'hw-legacy-auth',
    storage: storage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Auth helpers
export const signUp = async (email: string, password: string) => {
  try {
    const redirectTo = isProd 
      ? `${productionUrl}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email: email,
          email_verified: false,
          phone_verified: false
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Signup process error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unknown error occurred during signup')
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Clear any existing session first
    await supabase.auth.signOut();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    if (!data.session) {
      throw new Error('No session returned after successful sign in');
    }

    // Verify the session is valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Session verification error:', sessionError);
      throw sessionError || new Error('Failed to verify session');
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign in process error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unknown error occurred during sign in')
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Safely clear local storage
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('hw-legacy-auth');
    }
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      error: error instanceof Error ? error : new Error('An unknown error occurred during sign out')
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      user: null,
      error: error instanceof Error ? error : new Error('An unknown error occurred while getting user')
    };
  }
};