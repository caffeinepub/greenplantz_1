import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetVendorOrders } from '../hooks/useQueries';
import ProductUploadForm from '../components/ProductUploadForm';
import ProductList from '../components/ProductList';
import { Package, ShoppingBag, IndianRupee, Loader2 } from 'lucide-react';

export default function VendorDashboard() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading: ordersLoading } = useGetVendorOrders();

  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const completedOrders = orders.filter((o) => o.paymentStatus === 'paid');

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/vendor-hero.dim_1200x400.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="relative container h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
            <p className="text-lg opacity-90">Manage your products and orders</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Orders</span>
              <Package className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Completed Orders</span>
              <IndianRupee className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{completedOrders.length}</div>
          </div>
        </div>

        {/* Product Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload New Product</h2>
          <ProductUploadForm />
        </div>

        {/* Product List Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Products</h2>
          <ProductList vendorId={identity?.getPrincipal()} />
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Assigned Orders</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card rounded-xl p-12 border border-border text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders assigned yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id.toString()} className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id.toString()}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{order.details}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Shipping Address:</span>
                      <p className="text-muted-foreground mt-1">{order.shippingAddress}</p>
                    </div>
                    {order.trackingInfo && (
                      <div>
                        <span className="font-medium">Tracking Info:</span>
                        <p className="text-muted-foreground mt-1">{order.trackingInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
