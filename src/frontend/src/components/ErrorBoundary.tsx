import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log to help with production debugging
    if (typeof window !== 'undefined') {
      console.error('Environment:', {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.toLowerCase().includes('auth') ||
                          this.state.error?.message?.toLowerCase().includes('identity') ||
                          this.state.error?.message?.toLowerCase().includes('login');

      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') ||
                             this.state.error?.message?.toLowerCase().includes('fetch') ||
                             this.state.error?.message?.toLowerCase().includes('connection');

      const isRouterError = this.state.error?.message?.toLowerCase().includes('router') ||
                            this.state.error?.message?.toLowerCase().includes('route');

      let errorTitle = 'Something went wrong';
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (isAuthError) {
        errorTitle = 'Authentication Error';
        errorMessage = 'There was a problem with authentication. Please try logging in again.';
      } else if (isNetworkError) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (isRouterError) {
        errorTitle = 'Navigation Error';
        errorMessage = 'There was a problem loading the page. Please try again.';
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
          <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{errorTitle}</h2>
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 w-full text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleReset} className="w-full">
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
