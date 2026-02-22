import { useState } from 'react';
import type { Order, Vendor } from '../types';
import VendorAssignment from './VendorAssignment';
import ShippingDetailsForm from './ShippingDetailsForm';
import OrderStatusEditor from './OrderStatusEditor';
import PaymentStatusEditor from './PaymentStatusEditor';
import { Package, MapPin, Truck, User, IndianRupee, FileText } from 'lucide-react';

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

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      fulfilled: 'bg-green-500/10 text-green-500',
      success: 'bg-blue-500/10 text-blue-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      returned: 'bg-red-500/10 text-red-500',
      cod: 'bg-purple-500/10 text-purple-500',
      damaged: 'bg-orange-500/10 text-orange-500',
    };
    return statusMap[status] || 'bg-gray-500/10 text-gray-500';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Fully Paid': 'bg-green-500/10 text-green-500',
      'Partially Paid': 'bg-yellow-500/10 text-yellow-500',
      'Pending': 'bg-orange-500/10 text-orange-500',
      'Adjustment Settlement': 'bg-blue-500/10 text-blue-500',
    };
    return statusMap[status] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id.toString();

        return (
          <div key={order.id.toString()} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id.toString())}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="font-semibold text-lg">Order #{order.id.toString()}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.deliveryStatus)}`}>
                      {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                    {!order.vendorId && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{order.details}</p>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-muted-foreground">{order.shippingAddress}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {order.customerAddress.district}, {order.customerAddress.state} - {order.customerAddress.pincode}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <span className="font-medium">₹{order.amountReceived.toString()}</span>
                        <span className="text-muted-foreground text-xs">(Received)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">₹{order.shippingAmount.toString()}</span>
                        <span className="text-muted-foreground text-xs">(Shipping)</span>
                      </div>
                    </div>

                    {order.courierCompanyName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-medium">{order.courierCompanyName}</span>
                        {order.consignmentNumber && (
                          <span className="text-muted-foreground">• {order.consignmentNumber}</span>
                        )}
                      </div>
                    )}

                    {order.assignedVendorPlace && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Vendor: {order.assignedVendorPlace}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-6 space-y-6 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Order Status</h4>
                    <OrderStatusEditor orderId={order.id} currentStatus={order.deliveryStatus} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Payment Status</h4>
                    <PaymentStatusEditor orderId={order.id} currentPaymentStatus={order.paymentStatus} />
                  </div>
                </div>
                
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
