import { useState } from 'react';
import { useGetAllOrders, useGetAllVendors } from '../hooks/useQueries';
import OrderCreationForm from '../components/OrderCreationForm';
import OrderManagement from '../components/OrderManagement';
import PaymentManagement from '../components/PaymentManagement';
import VendorManagement from '../components/VendorManagement';
import ProductManagementAdmin from '../components/ProductManagementAdmin';
import TeamMemberManagement from '../components/TeamMemberManagement';
import { Loader2, Package, Users, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: vendors = [], isLoading: vendorsLoading } = useGetAllVendors();
  const [activeTab, setActiveTab] = useState<'orders' | 'create' | 'payments' | 'vendors' | 'products' | 'team'>('orders');

  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const unassignedOrders = orders.filter((o) => !o.vendorId);
  const activeVendors = vendors.filter((v) => v.active);

  if (ordersLoading || vendorsLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/admin-hero.dim_1200x400.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="relative container h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-lg opacity-90">Manage orders, vendors, products, and payments</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Unassigned</span>
              <Package className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">{unassignedOrders.length}</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Payment</span>
              <IndianRupee className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Vendors</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">
              {activeVendors.length}/{vendors.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Manage Orders
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Order
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vendor Management
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Product Management
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'team'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Team Members
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && <OrderManagement orders={orders} vendors={vendors} />}
        {activeTab === 'create' && <OrderCreationForm />}
        {activeTab === 'payments' && <PaymentManagement orders={orders} />}
        {activeTab === 'vendors' && <VendorManagement />}
        {activeTab === 'products' && <ProductManagementAdmin />}
        {activeTab === 'team' && <TeamMemberManagement />}
      </div>
    </div>
  );
}
