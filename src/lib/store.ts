import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

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
      console.log('Starting auth store initialization...');
      
      // Prevent multiple simultaneous initializations
      const state = get();
      if (state.initializationPromise) {
        console.log('Initialization already in progress, waiting...');
        await state.initializationPromise;
        return;
      }

      // If already initialized and has valid session, skip
      if (state.initialized && state.session?.access_token && state.user) {
        console.log('Already initialized with valid session, skipping...');
        return;
      }

      const initPromise = (async () => {
        try {
          console.log('Setting initialized to false...');
          set({ initialized: false });

          // Get initial session
          console.log('Getting initial session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          if (!session) {
            console.log('No session found');
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          console.log('Session found, getting user data...');
          // Get user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error('User error:', userError);
            set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          try {
            console.log('Checking admin status...');
            // Check if user is admin using the materialized view
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('user_id')
              .eq('user_id', user.id)
              .maybeSingle();

            if (adminError) {
              console.error('Error checking admin status:', adminError);
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

            console.log('Setting final state...', {
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
            console.error('Error checking admin status:', error);
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
          console.error('Error during initialization:', error);
          set({ 
            user: null, 
            session: null,
            isAdmin: false,
            initialized: true,
            initializationPromise: null
          });
        }
      })();

      console.log('Setting initialization promise...');
      set({ initializationPromise: initPromise });
      await initPromise;
      console.log('Initialization complete');
    } catch (error) {
      console.error('Error in initialize function:', error);
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