import { Session, User, AuthError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { logger } from './logger';

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  session: Session | null;
  initialized: boolean;
  initializationPromise: Promise<void> | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
}

interface RoleData {
  role: {
    name: string;
  } | null;
}

const createAuthStore = (
  set: (
    partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>),
    replace?: boolean
  ) => void,
  get: () => AuthState
): AuthState => ({
  user: null,
  isAdmin: false,
  session: null,
  initialized: false,
  initializationPromise: null,
  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
  setInitialized: (initialized: boolean) => set({ initialized }),
  initialize: async () => {
    try {
      logger.info('Starting auth store initialization...');
      
      // Prevent multiple simultaneous initializations
      const state = get();
      if (state.initializationPromise) {
        logger.debug('Initialization already in progress, waiting...');
        await state.initializationPromise;
        return;
      }

      // If already initialized and has valid session, skip
      if (state.initialized && state.session?.access_token && state.user) {
        logger.debug('Already initialized with valid session, skipping...');
        return;
      }

      const initPromise = (async () => {
        try {
          logger.debug('Setting initialized to false...');
          set({ initialized: false });

          // Get initial session
          logger.debug('Getting initial session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            const error = sessionError instanceof AuthError ? sessionError : new Error('Unknown session error');
            logger.error('Session error:', error);
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          if (!session) {
            logger.info('No session found');
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          logger.info('Session found, getting user data...', { userId: session.user.id });
          // Get user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            const error = userError instanceof AuthError ? userError : new Error('Unknown user error');
            logger.error('User error:', error);
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          try {
            logger.debug('Checking admin status...', { userId: user.id });
            // First try the materialized view
            const { data: adminData, error: adminViewError } = await supabase
              .from('admin_users')
              .select('user_id')
              .eq('user_id', user.id)
              .maybeSingle();

            // If the view doesn't exist, try the direct join approach
            if (adminViewError && adminViewError.message.includes('does not exist')) {
              logger.warn('Admin view not found, checking roles directly...', { userId: user.id });
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select(`
                  role:roles (
                    name
                  )
                `)
                .eq('user_id', user.id) as { data: RoleData[] | null, error: any };

              if (roleError) {
                logger.error('Error checking roles:', roleError);
                // Don't fail initialization on role check error
                set({ 
                  user, 
                  session,
                  isAdmin: false,
                  initialized: true,
                  initializationPromise: null
                });
                return;
              }

              const isAdmin = roleData?.some(r => r.role?.name === 'admin') ?? false;
              logger.info('Setting final state from roles...', {
                userId: user.id,
                hasUser: !!user,
                hasSession: !!session,
                isAdmin
              });

              set({ 
                user, 
                session,
                isAdmin,
                initialized: true,
                initializationPromise: null
              });
              return;
            }

            if (adminViewError) {
              logger.error('Error checking admin status:', adminViewError);
              // Don't fail initialization on admin check error
              set({ 
                user, 
                session,
                isAdmin: false,
                initialized: true,
                initializationPromise: null
              });
              return;
            }

            logger.info('Setting final state...', {
              userId: user.id,
              hasUser: !!user,
              hasSession: !!session,
              isAdmin: !!adminData
            });

            set({ 
              user, 
              session,
              isAdmin: !!adminData,
              initialized: true,
              initializationPromise: null
            });
          } catch (error) {
            logger.error('Error checking admin status:', error as Error);
            // Don't fail initialization on admin check error
            set({ 
              user, 
              session,
              isAdmin: false,
              initialized: true,
              initializationPromise: null
            });
          }
        } catch (error) {
          logger.error('Error during initialization:', error as Error);
          set({ 
            user: null, 
            session: null,
            isAdmin: false,
            initialized: true,
            initializationPromise: null
          });
        }
      })();

      logger.debug('Setting initialization promise...');
      set({ initializationPromise: initPromise });
      await initPromise;
      logger.info('Initialization complete');
    } catch (error) {
      logger.error('Error in initialize function:', error as Error);
      set({ 
        user: null, 
        session: null,
        isAdmin: false,
        initialized: true,
        initializationPromise: null
      });
    }
  }
});

export const useAuthStore = create<AuthState>()(
  persist(
    createAuthStore,
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin
      }),
      skipHydration: true // Add this to prevent hydration issues
    }
  )
);

// Initialize store hydration
if (typeof window !== 'undefined') {
  useAuthStore.persist.rehydrate();
}