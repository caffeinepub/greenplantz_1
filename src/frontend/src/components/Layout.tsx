import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Leaf, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useGetCallerUserRole } from '../hooks/useQueries';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === 'admin';

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

  const handleDashboard = () => {
    if (isAdmin) {
      navigate({ to: '/admin' });
    } else {
      navigate({ to: '/vendor' });
    }
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

          <nav className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            )}
            <button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors font-medium ${
                isAuthenticated
                  ? 'bg-muted hover:bg-muted/80 text-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              } disabled:opacity-50`}
            >
              {loginStatus === 'logging-in' ? (
                'Logging in...'
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Login
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4 text-primary" />
              <span>© {new Date().getFullYear()} GreenPlantz. All rights reserved.</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with{' '}
              <span className="text-red-500">❤</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
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
