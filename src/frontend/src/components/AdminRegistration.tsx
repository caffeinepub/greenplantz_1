import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import {
  useGetCallerUserProfile,
  useGetCallerAdminProfile,
  useSaveCallerUserProfile,
  useSaveCallerAdminProfile,
} from '../hooks/useQueries';
import { Shield, Loader2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRegistration() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: adminProfile, isLoading: adminLoading } = useGetCallerAdminProfile();
  const saveUserProfile = useSaveCallerUserProfile();
  const saveAdminProfile = useSaveCallerAdminProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'logging-in' || (isAuthenticated && actorFetching);
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showAdminSetup = isAuthenticated && userProfile !== null && !adminLoading && adminProfile === null;

  useEffect(() => {
    if (isAuthenticated && userProfile && adminProfile) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, userProfile, adminProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const email = formData.email.toLowerCase().trim();

      if (showProfileSetup) {
        await saveUserProfile.mutateAsync({
          name: formData.name,
          userType: 'admin',
          email: email,
        });

        if (email === 'greenplantz2020@gmail.com') {
          navigate({ to: '/admin' });
          return;
        }
      }

      if (showAdminSetup || showProfileSetup) {
        await saveAdminProfile.mutateAsync({
          name: formData.name,
          email: email,
        });
      }

      navigate({ to: '/admin' });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
              <p className="text-muted-foreground">Login to access the admin dashboard</p>
            </div>

            <button
              onClick={login}
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
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing || profileLoading || adminLoading || !actor) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <LoadingSpinner text="Initializing your session..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Admin Setup</h2>
            <p className="text-muted-foreground">Complete your admin profile</p>
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
            </div>

            <button
              type="submit"
              disabled={saveUserProfile.isPending || saveAdminProfile.isPending}
              className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveUserProfile.isPending || saveAdminProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
