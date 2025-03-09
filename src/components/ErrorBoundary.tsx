import React, { Component, ErrorInfo } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isConfigError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isConfigError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const isConfigError = error.message.includes('configuration error') || 
                         error.message.includes('environment variables');
    return {
      hasError: true,
      error,
      isConfigError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary:', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {this.state.isConfigError ? 'Configuration Error' : 'Something went wrong'}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {this.state.isConfigError ? (
                  <>
                    The application is not configured correctly. This is likely a temporary issue.
                    <br />
                    Please try again in a few minutes.
                  </>
                ) : (
                  this.state.error?.message || 'An unexpected error occurred'
                )}
              </p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;