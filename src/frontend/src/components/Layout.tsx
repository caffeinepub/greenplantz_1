import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Leaf, User, LogOut, LayoutDashboard, Shield, UserPlus } from 'lucide-react';
import { useIsCallerAdmin, useGetCallerVendorProfile } from '../hooks/useQueries';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: vendorProfile } = useGetCallerVendorProfile();

  const isAuthenticated = !!identity;
  const isVendor = !!vendorProfile && !isAdmin;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleAdminDashboard = () => {
    navigate({ to: '/admin' });
  };

  const handleVendorDashboard = () => {
    navigate({ to: '/vendor' });
  };

  const handleAdminLogin = () => {
    console.log('[Layout] Admin Login clicked - navigating to /admin/register');
    navigate({ to: '/admin/register' });
  };

  const handleAdminSignUp = () => {
    console.log('[Layout] Admin Sign Up clicked - navigating to /admin/register');
    navigate({ to: '/admin/register' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/assets/123.jpg" alt="GreenPlantz" className="h-12 max-h-12 object-contain" />
          </button>

          <nav className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <button
                  onClick={handleAdminLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin Login
                </button>
                <button
                  onClick={handleAdminSignUp}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Admin Sign Up
                </button>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <button
                onClick={handleAdminDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </button>
            )}
            {isAuthenticated && isVendor && (
              <button
                onClick={handleVendorDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Vendor Dashboard
              </button>
            )}
            <button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              } disabled:opacity-50`}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} GreenPlantz. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Leaf className="h-4 w-4 text-primary" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'greenplantz'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
