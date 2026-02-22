import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole } from '../backend';

export default function AdminRegistration() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, loginError, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminCheckLoading, isFetched: adminCheckFetched } = useIsCallerAdmin();
  const saveUserProfile = useSaveCallerUserProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const [authorizationChecked, setAuthorizationChecked] = useState(false);

  // Helper function to add debug logs
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('[AdminAuth]', logMessage, data || '');
    setDebugInfo(prev => [...prev, data ? `${logMessage}: ${JSON.stringify(data, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    )}` : logMessage]);
  };

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'logging-in' || (isAuthenticated && actorFetching);
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null && !hasError;

  // Log authentication state changes
  useEffect(() => {
    addDebugLog('Authentication state changed', {
      isAuthenticated,
      loginStatus,
      actorFetching,
      profileLoading,
      profileFetched,
      hasUserProfile: !!userProfile,
      userProfileRole: userProfile?.role,
      hasActor: !!actor,
      principalId: identity?.getPrincipal().toString(),
      isAdmin,
      adminCheckLoading,
      adminCheckFetched,
    });
  }, [isAuthenticated, loginStatus, actorFetching, profileLoading, profileFetched, userProfile, actor, identity, isAdmin, adminCheckLoading, adminCheckFetched]);

  // Monitor actor initialization
  useEffect(() => {
    if (isAuthenticated && !actor && !actorFetching) {
      addDebugLog('WARNING: Authenticated but actor not available', {
        actorFetching,
        hasActor: !!actor,
      });
      setStatusMessage('Waiting for backend connection...');
    } else if (isAuthenticated && actor) {
      addDebugLog('Actor successfully initialized', {
        principalId: identity?.getPrincipal().toString(),
      });
      setStatusMessage('Backend connected, verifying admin access...');
    }
  }, [isAuthenticated, actor, actorFetching, identity]);

  // Monitor profile loading errors
  useEffect(() => {
    if (profileError) {
      addDebugLog('Profile loading error', {
        error: profileError,
        errorMessage: profileError instanceof Error ? profileError.message : String(profileError),
        errorStack: profileError instanceof Error ? profileError.stack : undefined,
      });
      
      // Check if it's an authorization error
      const errorMessage = profileError instanceof Error ? profileError.message : String(profileError);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authorized') || errorMessage.includes('Admin access required')) {
        setHasError(true);
        setStatusMessage('Access denied: Admin authorization required');
        toast.error('Access Denied', {
          description: 'You must be an authorized admin (greenplantz2020@gmail.com or active team member) to access the admin dashboard.',
        });
      } else {
        setHasError(true);
        setStatusMessage('Error loading profile');
      }
    }
  }, [profileError]);

  // Check admin authorization after profile is loaded
  useEffect(() => {
    if (isAuthenticated && profileFetched && userProfile && adminCheckFetched && !authorizationChecked) {
      addDebugLog('Checking admin authorization', {
        userProfile,
        userProfileRole: userProfile.role,
        isAdmin,
        adminCheckFetched,
      });

      if (isAdmin === false) {
        addDebugLog('User is not an authorized admin');
        setHasError(true);
        setStatusMessage('Access denied: You are not an authorized admin');
        toast.error('Access Denied', {
          description: 'You must be an authorized admin (greenplantz2020@gmail.com or active team member) to access the admin dashboard.',
        });
        setAuthorizationChecked(true);
        return;
      }

      if (isAdmin === true) {
        addDebugLog('User is authorized admin, redirecting to dashboard');
        setStatusMessage('Access granted, redirecting...');
        setAuthorizationChecked(true);
        navigate({ to: '/admin' });
      }
    }
  }, [isAuthenticated, profileFetched, userProfile, adminCheckFetched, isAdmin, authorizationChecked, navigate]);

  // Handle login errors
  useEffect(() => {
    if (loginError) {
      addDebugLog('Login error occurred', {
        error: loginError,
        errorMessage: loginError.message,
        errorStack: loginError.stack,
      });
      setHasError(true);
      toast.error('Authentication Failed', {
        description: 'There was a problem logging in. Please try again or check your browser settings.',
      });
    }
  }, [loginError]);

  const handleLogin = async () => {
    try {
      addDebugLog('Starting Internet Identity login...');
      setStatusMessage('Authenticating with Internet Identity...');
      setHasError(false);
      setDebugInfo([]);
      setAuthorizationChecked(false);
      await login();
      addDebugLog('Internet Identity login completed');
    } catch (error) {
      addDebugLog('Login failed with error', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      setHasError(true);
      setStatusMessage('Authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const email = formData.email.toLowerCase().trim();
      const name = formData.name.trim();

      if (!name || !email) {
        toast.error('Missing Information', {
          description: 'Please provide both your name and email address.',
        });
        return;
      }

      if (!actor) {
        addDebugLog('ERROR: Cannot submit - actor not available', {
          hasActor: !!actor,
          actorFetching,
        });
        toast.error('Backend Not Ready', {
          description: 'Backend connection not established. Please wait and try again.',
        });
        return;
      }

      // Create the profile object with the correct structure matching backend UserProfile type
      const profileToSave = {
        name,
        email,
        role: UserRole.admin, // Use the UserRole enum from backend
        businessName: undefined, // Optional field
        phone: undefined, // Optional field
      };

      addDebugLog('Submitting admin profile', {
        profileStructure: profileToSave,
        roleType: typeof profileToSave.role,
        roleValue: profileToSave.role,
      });
      setStatusMessage('Creating user profile...');

      // Save user profile with admin role
      await saveUserProfile.mutateAsync(profileToSave);

      addDebugLog('Admin profile saved successfully');
      setStatusMessage('Profile created, verifying admin access...');
      
      toast.success('Profile Created', {
        description: 'Your admin profile has been created successfully.',
      });

      // Reset authorization check to trigger re-verification
      setAuthorizationChecked(false);
    } catch (error) {
      addDebugLog('Registration error', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : undefined,
        errorCause: error instanceof Error ? (error as any).cause : undefined,
      });
      
      setHasError(true);
      setStatusMessage('Registration failed');
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('not authorized') || error.message.includes('Admin access required')) {
          toast.error('Access Denied', {
            description: 'You do not have admin privileges. Only greenplantz2020@gmail.com or active team members can access the admin dashboard.',
          });
        } else if (error.message.includes('Invalid record') || error.message.includes('argument field')) {
          toast.error('Registration Failed', {
            description: 'Profile data format error. Please contact support.',
          });
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Network Error', {
            description: 'Unable to connect to the server. Please check your internet connection and try again.',
          });
        } else {
          toast.error('Registration Failed', {
            description: error.message || 'An unexpected error occurred. Please try again.',
          });
        }
      } else {
        toast.error('Registration Failed', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  const handleTryAgain = async () => {
    addDebugLog('User clicked Try Again - resetting state');
    setHasError(false);
    setDebugInfo([]);
    setStatusMessage('');
    setFormData({ name: '', email: '' });
    setAuthorizationChecked(false);
    
    // Clear authentication and start fresh
    try {
      await clear();
      addDebugLog('Authentication cleared successfully');
    } catch (error) {
      addDebugLog('Error clearing authentication', { error });
    }
  };

  // Not authenticated - show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
              <p className="text-muted-foreground">Login to access the admin dashboard</p>
            </div>

            {hasError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                  There was a problem with authentication. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <button
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to Continue'
              )}
            </button>

            {loginError && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">
                  Authentication failed. Please try again.
                </p>
              </div>
            )}

            {/* Debug information in development */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <details className="mt-6 p-4 bg-muted rounded-lg text-xs">
                <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
                <div className="space-y-1 font-mono max-h-60 overflow-y-auto">
                  {debugInfo.map((log, i) => (
                    <div key={i} className="text-muted-foreground">{log}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but still loading profile data or checking admin status
  if (isInitializing || profileLoading || adminCheckLoading || !actor || !profileFetched || !adminCheckFetched) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="text-center">
          <LoadingSpinner text={statusMessage || 'Verifying admin access...'} />
          
          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-card rounded-lg text-xs max-w-2xl mx-auto">
              <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
              <div className="space-y-1 font-mono text-left max-h-60 overflow-y-auto">
                {debugInfo.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Error state with recovery option
  if (hasError && !showProfileSetup) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You do not have permission to access the admin dashboard.
              </p>
            </div>

            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authorization Required</AlertTitle>
              <AlertDescription>
                {statusMessage || 'Only authorized administrators (greenplantz2020@gmail.com or active team members) can access this area.'}
              </AlertDescription>
            </Alert>

            <button
              onClick={handleTryAgain}
              className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Try Again
            </button>

            {/* Debug information */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <details className="mt-6 p-4 bg-muted rounded-lg text-xs">
                <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
                <div className="space-y-1 font-mono max-h-60 overflow-y-auto">
                  {debugInfo.map((log, i) => (
                    <div key={i} className="text-muted-foreground">{log}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and profile doesn't exist - show setup form
  if (showProfileSetup) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 p-4">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Admin Setup</h2>
              <p className="text-muted-foreground">Complete your admin profile</p>
              {statusMessage && (
                <p className="text-sm text-primary mt-2">{statusMessage}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="your.email@example.com"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Use greenplantz2020@gmail.com for automatic admin access
                </p>
              </div>

              <button
                type="submit"
                disabled={saveUserProfile.isPending || !actor}
                className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveUserProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>

            {/* Debug information in development */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <details className="mt-6 p-4 bg-muted rounded-lg text-xs">
                <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
                <div className="space-y-1 font-mono max-h-60 overflow-y-auto">
                  {debugInfo.map((log, i) => (
                    <div key={i} className="text-muted-foreground">{log}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Profile exists but waiting for admin check
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="text-center">
        <LoadingSpinner text="Verifying admin access..." />
        
        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 p-4 bg-card rounded-lg text-xs max-w-2xl mx-auto">
            <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
            <div className="space-y-1 font-mono text-left max-h-60 overflow-y-auto">
              {debugInfo.map((log, i) => (
                <div key={i} className="text-muted-foreground">{log}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
