import React from 'react';
import { useAuth } from '../context/AuthContext';
import { logger } from '../lib/logger';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LoginButton({ className = '', children }: LoginButtonProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Test Supabase connection
      await signIn('test@example.com', 'password');
      logger.info('Login button clicked, Supabase connection verified');
    } catch (err) {
      const error = err as Error;
      logger.error('Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? 'Loading...' : children || 'Sign in'}
      {error && (
        <span className="ml-2 text-sm text-red-200">
          {error}
        </span>
      )}
    </button>
  );
} 