import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced logging for production debugging
    console.error('ErrorBoundary caught an error:', {
      error: error.toString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Categorize error types for better debugging
    const errorType = this.categorizeError(error);
    console.error('Error type:', errorType);

    this.setState({
      error,
      errorInfo,
    });
  }

  categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('unauthorized') || message.includes('permission') || message.includes('auth')) {
      return 'AUTHENTICATION_ERROR';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    
    if (message.includes('router') || message.includes('navigation') || message.includes('route')) {
      return 'ROUTER_ERROR';
    }
    
    if (message.includes('actor') || message.includes('canister')) {
      return 'BACKEND_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const errorType = this.state.error ? this.categorizeError(this.state.error) : 'UNKNOWN_ERROR';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10 p-4">
          <div className="max-w-2xl w-full bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-muted-foreground">
                  {errorType === 'AUTHENTICATION_ERROR' && 'There was a problem with authentication'}
                  {errorType === 'NETWORK_ERROR' && 'Unable to connect to the server'}
                  {errorType === 'ROUTER_ERROR' && 'Navigation error occurred'}
                  {errorType === 'BACKEND_ERROR' && 'Backend service error'}
                  {errorType === 'UNKNOWN_ERROR' && 'An unexpected error occurred'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {errorType === 'AUTHENTICATION_ERROR' && 'Please try logging out and logging back in. If the problem persists, clear your browser cache.'}
                {errorType === 'NETWORK_ERROR' && 'Please check your internet connection and try again.'}
                {errorType === 'ROUTER_ERROR' && 'Please try refreshing the page or navigating back to the home page.'}
                {errorType === 'BACKEND_ERROR' && 'The backend service is experiencing issues. Please try again later.'}
                {errorType === 'UNKNOWN_ERROR' && 'We apologize for the inconvenience. Please try refreshing the page.'}
              </p>

              {isDev && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <strong>Error Type:</strong> {errorType}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 overflow-auto max-h-40 text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto max-h-40 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/90 transition-colors"
                >
                  Go to Home
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
