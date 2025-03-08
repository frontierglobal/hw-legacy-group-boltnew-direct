import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  session: any | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      session: null,
      initialized: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setInitialized: (initialized) => set({ initialized }),
      initialize: async () => {
        try {
          // Get initial session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Check if user is admin
            const { data: adminData } = await supabase
              .from('user_roles')
              .select('roles!inner(*)')
              .eq('user_id', user?.id)
              .eq('roles.name', 'admin')
              .maybeSingle();

            set({ 
              user, 
              session,
              isAdmin: !!adminData,
              initialized: true 
            });
          } else {
            set({ 
              user: null, 
              session: null,
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin 
      })
    }
  )
);