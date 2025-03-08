import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // If successful, redirect to the dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during auth callback:', error);
        // On error, redirect to login
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

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