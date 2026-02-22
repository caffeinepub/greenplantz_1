import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerVendorProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, Store } from 'lucide-react';
import { UserRole } from '../backend';

export default function VendorRegistration() {
  const navigate = useNavigate();
  const { login, identity, loginStatus } = useInternetIdentity();
  const saveVendorProfile = useSaveCallerVendorProfile();
  const saveUserProfile = useSaveCallerUserProfile();
  const [formData, setFormData] = useState({
    businessName: '',
    contactInfo: '',
    address: '',
    pincode: '',
    email: '',
    name: '',
  });

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        // User is already logged in, just proceed
        return;
      }
      alert('Failed to login. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login first');
      return;
    }

    try {
      // Save user profile first with vendor role
      await saveUserProfile.mutateAsync({
        name: formData.name,
        email: formData.email,
        role: UserRole.vendor,
        businessName: formData.businessName,
        phone: formData.contactInfo,
      });

      // Then save vendor profile
      await saveVendorProfile.mutateAsync({
        businessName: formData.businessName,
        contactInfo: formData.contactInfo,
        address: formData.address,
        pincode: BigInt(formData.pincode),
      });

      alert('Registration successful!');
      navigate({ to: '/vendor' });
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Store className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Vendor Registration</h2>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">Please login with Internet Identity to continue</p>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login with Internet Identity'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Information</label>
                <input
                  type="text"
                  required
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Phone number or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                  placeholder="Enter your complete business address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input
                  type="number"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter pincode"
                />
              </div>

              <button
                type="submit"
                disabled={saveVendorProfile.isPending || saveUserProfile.isPending}
                className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveVendorProfile.isPending || saveUserProfile.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
