import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // If successful, redirect to the dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error during auth callback:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // On error, redirect to login after a short delay
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

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