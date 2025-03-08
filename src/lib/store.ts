import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { StateCreator } from 'zustand';

interface AuthState {
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
) => ({
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
      // Prevent multiple simultaneous initializations
      const state = createAuthStore(set, get);
      if (state.initializationPromise) {
        await state.initializationPromise;
        return;
      }

      const initPromise = (async () => {
        set({ initialized: false });

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
          return;
        }

        if (!session) {
          set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
          return;
        }

        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User error:', userError);
          set({ user: null, session: null, isAdmin: false, initialized: true, initializationPromise: null });
          return;
        }

        try {
          // Check if user has admin role
          const { data: adminData, error: adminError } = await supabase
            .from('user_roles')
            .select('roles!inner(name)')
            .eq('user_id', user.id)
            .eq('roles.name', 'admin')
            .maybeSingle();

          if (adminError) {
            console.error('Error checking admin status:', adminError);
            set({ user, session, isAdmin: false, initialized: true, initializationPromise: null });
            return;
          }

          set({ 
            user, 
            session,
            isAdmin: !!adminData,
            initialized: true,
            initializationPromise: null
          });
        } catch (error) {
          console.error('Error checking admin status:', error);
          set({ 
            user, 
            session,
            isAdmin: false,
            initialized: true,
            initializationPromise: null
          });
        }
      })();

      set({ initializationPromise: initPromise });
      await initPromise;
    } catch (error) {
      console.error('Error initializing auth store:', error);
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
      name: 'hw-legacy-auth-store',
      storage: createJSONStorage(() => {
        try {
          const storage = localStorage;
          return {
            getItem: (name: string) => {
              const value = storage.getItem(name);
              return value ? JSON.parse(value) : null;
            },
            setItem: (name: string, value: any) => {
              storage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name: string) => {
              storage.removeItem(name);
            },
          };
        } catch {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      partialize: (state: AuthState) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.session) {
          state.initialize();
        } else {
          state?.setInitialized(true);
        }
      }
    }
  )
);