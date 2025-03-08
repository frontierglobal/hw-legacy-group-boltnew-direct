import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          if (session) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              throw userError;
            }

            if (!user) {
              throw new Error('User not found');
            }

            // Check if user is admin
            const { data: adminData, error: adminError } = await supabase
              .from('user_roles')
              .select('roles!inner(*)')
              .eq('user_id', user.id)
              .eq('roles.name', 'admin')
              .maybeSingle();

            if (adminError) {
              console.error('Error checking admin status:', adminError);
            }

            set({ 
              user, 
              session,
              isAdmin: !!adminData,
              initialized: true 
            });
          } else {
            // No session found, clear the state
            set({ 
              user: null, 
              session: null,
              isAdmin: false,
              initialized: true 
            });
          }
        } catch (error) {
          console.error('Error initializing auth store:', error);
          // On error, clear the state
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
      name: 'hw-legacy-auth-store',
      storage: localStorage,
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin 
      })
    }
  )
);