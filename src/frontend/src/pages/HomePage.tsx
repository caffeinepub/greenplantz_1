import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Leaf, Package, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const handleVendorRegister = () => {
    navigate({ to: '/vendor' });
  };

  return (
    <div className="flex flex-col bg-[#e8f3ed]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Mint Green Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d4f1e3] text-[#047857] text-sm font-medium shadow-sm">
              <img 
                src="/assets/generated/leaf-icon.dim_24x24.png" 
                alt="Leaf" 
                className="h-5 w-5"
              />
              India's Premier Plant Marketplace
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Connect Nurseries with{' '}
              <span className="text-[#047857]">Green Dreams</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              A comprehensive platform for garden nursery vendors to manage products, fulfill orders, and grow their
              business across India.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={handleVendorRegister}
                className="px-8 py-3.5 rounded-full bg-[#047857] text-white font-semibold hover:bg-[#036146] transition-colors shadow-md cursor-pointer"
              >
                {identity ? 'Go to Dashboard' : 'Register as Vendor'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose GreenPlantz?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your nursery business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-[#d4f1e3] flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-[#047857]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Product Management</h3>
              <p className="text-gray-600">
                Upload products with photos, manage inventory, and update quantities in real-time. All pricing in
                Indian Rupees.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-[#d4f1e3] flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#047857]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Order Assignment</h3>
              <p className="text-gray-600">
                Orders are assigned to vendors based on pincode proximity, ensuring faster delivery and lower costs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-[#d4f1e3] flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-[#047857]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Payment Tracking</h3>
              <p className="text-gray-600">
                Track payments, shipping details, and order status all in one place. Complete transparency for vendors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#e8f3ed]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to Grow Your Business?</h2>
            <p className="text-lg text-gray-700">
              Join hundreds of nursery vendors across India who trust GreenPlantz for their business operations.
            </p>
            {!identity && (
              <button
                onClick={handleVendorRegister}
                className="px-8 py-3.5 rounded-full bg-[#047857] text-white font-semibold hover:bg-[#036146] transition-colors shadow-md cursor-pointer"
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
