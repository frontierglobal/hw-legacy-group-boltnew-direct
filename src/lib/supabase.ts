import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isProd = import.meta.env.PROD;
const productionUrl = import.meta.env.VITE_PRODUCTION_URL || 'https://hw-legacy-group-boltnew-direct-6sngrc6ty.vercel.app';

console.log('Initializing Supabase with:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  isProd,
  productionUrl
});

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
    console.error('localStorage not available:', e);
    return false;
  }
};

const storage = isLocalStorageAvailable() ? localStorage : undefined;

console.log('Creating Supabase client with config:', {
  persistSession: !!storage,
  storageKey: 'hw-legacy-auth',
  hasStorage: !!storage,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'pkce'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !!storage,
    storageKey: 'hw-legacy-auth',
    storage: storage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true // Enable debug mode for auth
  }
});

// Log initial session state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Error getting initial session:', error);
  } else {
    console.log('Initial session state:', {
      hasSession: !!session,
      user: session?.user?.email
    });
  }
});

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, {
    hasSession: !!session,
    user: session?.user?.email
  });
});

// Auth helpers
export const signUp = async (email: string, password: string) => {
  try {
    const redirectTo = isProd 
      ? `${productionUrl}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    console.log('Attempting signup with redirectTo:', redirectTo);

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
    console.log('Starting sign-in process...');

    // Clear any existing session first
    console.log('Clearing existing session...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Error clearing existing session:', signOutError);
    }

    // Attempt to sign in
    console.log('Attempting to sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in response:', { 
      session: data.session ? 'present' : 'missing',
      user: data.user ? 'present' : 'missing',
      email: data.user?.email
    });

    if (!data.session) {
      console.error('No session in sign-in response');
      throw new Error('No session returned after successful sign in');
    }

    // Verify the session is valid
    console.log('Verifying session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session verification error:', sessionError);
      throw sessionError;
    }

    if (!sessionData.session) {
      console.error('No session found in verification');
      throw new Error('Failed to verify session');
    }

    console.log('Sign in successful, session verified');
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
    console.log('Starting sign out process...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Safely clear local storage
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('hw-legacy-auth');
      console.log('Local storage cleared');
    }

    console.log('Sign out successful');
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
    console.log('Getting current user...');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    console.log('Current user:', user?.email || 'none');
    return { user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      user: null,
      error: error instanceof Error ? error : new Error('An unknown error occurred while getting user')
    };
  }
};