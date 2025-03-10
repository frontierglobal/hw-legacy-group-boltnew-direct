import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { initialize } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        // Get the access token from the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (!accessToken) {
          throw new Error('No access token found in URL');
        }

        // Set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          throw sessionError;
        }

        // Get the session to verify it worked
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          throw getSessionError;
        }

        if (!session) {
          throw new Error('No session found after setting token');
        }

        // Initialize auth store
        await initialize();

        // Only update state if component is still mounted
        if (mounted) {
          // Clear the URL hash to prevent token exposure
          window.location.hash = '';
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          // On error, redirect to login after a short delay
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, initialize]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600">Authentication Error</h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verifying...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    </div>
  );
} 