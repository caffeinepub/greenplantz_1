import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import AdminDashboard from '../pages/AdminDashboard';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function ProtectedAdminRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading, isFetched: adminCheckFetched, error: adminCheckError } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Log the admin check state for debugging
  useEffect(() => {
    console.log('[ProtectedAdminRoute] State:', {
      isAuthenticated,
      isInitializing,
      adminCheckLoading,
      adminCheckFetched,
      isAdmin,
      adminCheckError,
      hasUserProfile: !!userProfile,
      userProfileRole: userProfile?.role,
      profileLoading,
      profileFetched,
    });
  }, [isAuthenticated, isInitializing, adminCheckLoading, adminCheckFetched, isAdmin, adminCheckError, userProfile, profileLoading, profileFetched]);

  // Show loading while initializing or checking admin status
  if (isInitializing || (isAuthenticated && (adminCheckLoading || profileLoading || !adminCheckFetched || !profileFetched))) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  // Not authenticated - redirect to home
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access the admin dashboard.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if admin check failed with an error
  if (adminCheckError) {
    console.error('[ProtectedAdminRoute] Admin check error:', adminCheckError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authorization Error</h2>
          <p className="text-muted-foreground mb-6">
            There was an error checking your admin privileges. Please try again.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Not an admin - show access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have admin privileges to access this dashboard.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and is an admin - show dashboard
  return <AdminDashboard />;
}
