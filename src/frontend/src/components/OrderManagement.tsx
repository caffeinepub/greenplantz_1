import { useState } from 'react';
import type { Order, Vendor } from '../types';
import VendorAssignment from './VendorAssignment';
import ShippingDetailsForm from './ShippingDetailsForm';
import { Package, MapPin, Truck } from 'lucide-react';

interface OrderManagementProps {
  orders: Order[];
  vendors: Vendor[];
}

export default function OrderManagement({ orders, vendors }: OrderManagementProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id.toString();
        const assignedVendor = order.vendorId
          ? vendors.find((v) => v.businessName) // Note: We can't directly compare Principal objects in UI
          : null;

        return (
          <div key={order.id.toString()} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id.toString())}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.id.toString()}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    {!order.vendorId && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{order.details}</p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{order.shippingAddress}</span>
                  </div>
                  {order.trackingInfo && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{order.trackingInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-6 space-y-6 bg-muted/20">
                <VendorAssignment order={order} vendors={vendors} />
                <ShippingDetailsForm order={order} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
