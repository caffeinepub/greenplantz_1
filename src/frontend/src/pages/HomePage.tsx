import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Leaf, Package, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Leaf className="h-4 w-4" />
              India's Premier Plant Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Connect Nurseries with <span className="text-primary">Green Dreams</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              A comprehensive platform for garden nursery vendors to manage products, fulfill orders, and grow their
              business across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {!identity ? (
                <>
                  <button
                    onClick={() => navigate({ to: '/vendor' })}
                    className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    Register as Vendor
                  </button>
                  <button
                    onClick={() => navigate({ to: '/admin' })}
                    className="px-8 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                  >
                    Admin Access
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate({ to: '/vendor' })}
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose GreenPlantz?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your nursery business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Product Management</h3>
              <p className="text-muted-foreground">
                Upload products with photos, manage inventory, and update quantities in real-time. All pricing in
                Indian Rupees.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Order Assignment</h3>
              <p className="text-muted-foreground">
                Orders are assigned to vendors based on pincode proximity, ensuring faster delivery and lower costs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Tracking</h3>
              <p className="text-muted-foreground">
                Track payments, shipping details, and order status all in one place. Complete transparency for vendors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Grow Your Business?</h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of nursery vendors across India who trust GreenPlantz for their business operations.
            </p>
            {!identity && (
              <button
                onClick={() => navigate({ to: '/vendor' })}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Today
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
