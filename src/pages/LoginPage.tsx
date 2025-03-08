import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signIn } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize, user, initialized } = useAuthStore();
  
  // Redirect if already logged in
  useEffect(() => {
    console.log('LoginPage mounted, checking user state:', { 
      hasUser: !!user,
      initialized
    });

    const checkAuth = async () => {
      if (!initialized) {
        console.log('Auth not initialized, initializing...');
        await initialize();
      }
      
      if (user) {
        console.log('User already logged in, redirecting to dashboard');
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [user, navigate, initialize, initialized]);
  
  const onSubmit = async (data: LoginFormData) => {
    console.log('Login form submitted');
    if (loading) {
      console.log('Already processing login, skipping');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting sign in process');
      const { data: userData, error: signInError } = await signIn(data.email, data.password);
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
      
      if (!userData?.session) {
        console.error('No session returned after sign in');
        throw new Error('No session returned after sign in');
      }

      console.log('Sign in successful, initializing auth store');
      await initialize();

      // Check if initialization was successful
      const { user: currentUser, initialized: isInitialized } = useAuthStore.getState();
      
      console.log('Checking initialization status:', {
        hasUser: !!currentUser,
        initialized: isInitialized
      });

      if (!isInitialized) {
        throw new Error('Failed to initialize auth store');
      }

      if (!currentUser) {
        throw new Error('Failed to initialize user session');
      }

      console.log('Auth store initialized, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (err instanceof Error) {
        // Handle specific error messages
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in';
        } else if (err.message.includes('storage') || err.message.includes('localStorage')) {
          errorMessage = 'Browser storage issue. Please ensure cookies are enabled and try again in a private/incognito window if the issue persists.';
        } else if (err.message.includes('Failed to initialize')) {
          errorMessage = 'Failed to initialize session. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogIn className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            register for a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  {...register('password', { 
                    required: 'Password is required'
                  })}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                onClick={() => console.log('Sign in button clicked')}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;