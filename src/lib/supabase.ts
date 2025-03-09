import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { mcpManager } from './mcp';

// Check if required environment variables are present
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment info (without sensitive data)
logger.info('Environment check:', {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. Please check:
1. Local development: Ensure these variables are in your .env file
2. Production: Ensure these variables are set in your Vercel project settings
3. After adding variables, rebuild and redeploy the application`;

  logger.error('Configuration Error:', new Error(errorMessage));
  
  // In development, show more helpful error
  if (import.meta.env.DEV) {
    throw new Error(errorMessage);
  } else {
    // In production, show a more generic error
    throw new Error('Application configuration error. Please contact support.');
  }
}

// Initialize MCP connection
let mcpConnection: any = null;

// Function to initialize MCP connection
async function initializeMCP() {
  try {
    mcpConnection = await mcpManager.connect('supabase');
    logger.info('MCP connection established successfully');
  } catch (error) {
    logger.error('Failed to establish MCP connection:', error as Error);
    // Continue without MCP - fallback to regular Supabase client
  }
}

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

// Initialize Supabase client with MCP configuration if available
logger.info('Initializing Supabase client...');

const supabaseOptions = {
  auth: {
    persistSession: isLocalStorageAvailable(),
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  ...(mcpConnection && {
    db: {
      schema: 'public',
      pool: mcpConnection.pool,
      ssl: mcpManager.getServerConfig('supabase')?.ssl,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      }
    }
  })
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Initialize MCP connection
initializeMCP().catch(error => {
  logger.error('Failed to initialize MCP:', error as Error);
});

// Set up auth state change listener with enhanced logging
supabase.auth.onAuthStateChange((event, session) => {
  logger.info('Auth state changed:', { 
    event, 
    hasSession: !!session,
    userId: session?.user?.id,
    mcpEnabled: !!mcpConnection
  });
});

// Enhanced helper functions with MCP support
export const signIn = async (email: string, password: string) => {
  logger.debug('Attempting sign in...', { email });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign in error:', error);
    } else {
      logger.info('Sign in successful', { 
        userId: data.user?.id,
        mcpEnabled: !!mcpConnection 
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
      
      // Clean up MCP connection if exists
      if (mcpConnection) {
        try {
          await mcpManager.disconnect('supabase');
          logger.info('MCP connection closed successfully');
        } catch (mcpError) {
          logger.error('Error closing MCP connection:', mcpError as Error);
        }
      }
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
        hasSession: !!session,
        mcpEnabled: !!mcpConnection 
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

// Clean up function to be called on application shutdown
export const cleanup = async () => {
  if (mcpConnection) {
    try {
      await mcpManager.disconnectAll();
      logger.info('All MCP connections closed successfully');
    } catch (error) {
      logger.error('Error closing MCP connections:', error as Error);
    }
  }
};

// Add logging for database operations
supabase.from = new Proxy(supabase.from, {
  get(target, prop) {
    const original = target[prop as keyof typeof target];
    if (typeof original === 'function') {
      return async (...args: any[]) => {
        try {
          logger.debug(`Supabase query: ${prop.toString()}`, args);
          const result = await original.apply(target, args);
          logger.debug(`Supabase result: ${prop.toString()}`, result);
          return result;
        } catch (error) {
          logger.error(`Supabase error: ${prop.toString()}`, error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
      };
    }
    return original;
  }
});