import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  session: Session | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
}

const authStore = (set: any) => ({
  user: null,
  isAdmin: false,
  session: null,
  initialized: false,
  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
  setInitialized: (initialized: boolean) => set({ initialized }),
  initialize: async () => {
    try {
      // Set initialized to false while we check
      set({ initialized: false });

      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        set({ user: null, session: null, isAdmin: false, initialized: true });
        return;
      }

      if (!session) {
        set({ user: null, session: null, isAdmin: false, initialized: true });
        return;
      }

      // Get user data
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User error:', userError);
        set({ user: null, session: null, isAdmin: false, initialized: true });
        return;
      }

      try {
        // Check if user has admin role using user_roles and roles tables
        const { data: adminData, error: adminError } = await supabase
          .from('user_roles')
          .select('roles!inner(name)')
          .eq('user_id', user.id)
          .eq('roles.name', 'admin')
          .single();

        if (adminError) {
          console.error('Error checking admin status:', adminError);
          set({ 
            user, 
            session,
            isAdmin: false,
            initialized: true 
          });
          return;
        }

        set({ 
          user, 
          session,
          isAdmin: !!adminData,
          initialized: true 
        });
      } catch (error) {
        console.error('Admin check error:', error);
        set({ 
          user, 
          session,
          isAdmin: false,
          initialized: true 
        });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({ 
        user: null, 
        session: null,
        isAdmin: false,
        initialized: true 
      });
    }
  }
});

export const useAuthStore = create<AuthState>()(
  persist(
    authStore,
    {
      name: 'hw-legacy-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin
      }),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, initialize if we have a session
        if (state?.session) {
          state.initialize();
        } else {
          state?.setInitialized(true);
        }
      }
    }
  )
);