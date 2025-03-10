import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasRedirected, setHasRedirected] = useState(false);

    // Initialize Supabase auth session
    const initializeAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkUserRole(session.user);
            }
            setIsLoading(false);
        } catch (error) {
            logger.error('Error initializing auth:', error instanceof Error ? error : new Error(String(error)));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initialize auth when component mounts
        initializeAuth();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            logger.info('Auth state changed:', { event });
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkUserRole(session.user);
            } else {
                setIsAdmin(false);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUserRole = async (user: User) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            const isUserAdmin = data?.role === 'admin';
            setIsAdmin(isUserAdmin);

            // Handle redirection based on role
            if (!hasRedirected) {
                const path = window.location.pathname;
                if (path === '/login' || path === '/register') {
                    logger.info('Redirecting after login:', { 
                        isAdmin: isUserAdmin, 
                        redirectTo: isUserAdmin ? '/admin' : '/dashboard' 
                    });
                    window.location.href = isUserAdmin ? '/admin' : '/dashboard';
                    setHasRedirected(true);
                }
            }
        } catch (error) {
            logger.error('Error checking user role:', error instanceof Error ? error : new Error(String(error)));
            setIsAdmin(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (error) {
            logger.error('Error signing in:', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setHasRedirected(false);
        } catch (error) {
            logger.error('Error signing out:', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
