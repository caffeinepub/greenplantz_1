import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerVendorProfile } from '../hooks/useQueries';
import VendorDashboard from '../pages/VendorDashboard';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircle } from 'lucide-react';

export default function ProtectedVendorRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: vendorProfile, isLoading: profileLoading } = useGetCallerVendorProfile();

  const isAuthenticated = !!identity;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return <LoadingSpinner text="Loading vendor dashboard..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access the vendor dashboard.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Vendor Profile</h2>
          <p className="text-muted-foreground mb-6">
            You need to register as a vendor first.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return <VendorDashboard />;
}
