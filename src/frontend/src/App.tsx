import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, ErrorComponent } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedVendorRoute from './components/ProtectedVendorRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Toaster />
    </Layout>
  ),
  errorComponent: ({ error }) => {
    console.error('Router error:', error);
    return <ErrorComponent error={error} />;
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  errorComponent: ({ error }) => {
    console.error('Index route error:', error);
    return <ErrorComponent error={error} />;
  },
});

const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vendor',
  component: () => <ProtectedVendorRoute />,
  errorComponent: ({ error }) => {
    console.error('Vendor route error:', error);
    return <ErrorComponent error={error} />;
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => <ProtectedAdminRoute />,
  errorComponent: ({ error }) => {
    console.error('Admin route error:', error);
    return <ErrorComponent error={error} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, vendorRoute, adminRoute]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error }) => {
    console.error('Default router error:', error);
    return <ErrorComponent error={error} />;
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
