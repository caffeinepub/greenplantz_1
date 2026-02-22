import { useState } from 'react';
import type { Order } from '../types';
import { IndianRupee, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaymentManagementProps {
  orders: Order[];
}

export default function PaymentManagement({ orders }: PaymentManagementProps) {
  const fullyPaidOrders = orders.filter((o) => o.paymentStatus === 'Fully Paid');
  const partiallyPaidOrders = orders.filter((o) => o.paymentStatus === 'Partially Paid');
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'Pending');
  const adjustmentOrders = orders.filter((o) => o.paymentStatus === 'Adjustment Settlement');

  const renderOrderList = (orderList: Order[], emptyMessage: string) => {
    if (orderList.length === 0) {
      return (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {orderList.map((order) => (
          <div key={order.id.toString()} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">Order #{order.id.toString()}</h4>
                  <span className="text-xs text-muted-foreground">
                    {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.details}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="font-medium">₹{order.amountReceived.toString()}</span>
                  </div>
                  {order.courierCompanyName && (
                    <span className="text-muted-foreground text-xs">
                      via {order.courierCompanyName}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'Fully Paid'
                    ? 'bg-green-500/10 text-green-500'
                    : order.paymentStatus === 'Partially Paid'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : order.paymentStatus === 'Adjustment Settlement'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-orange-500/10 text-orange-500'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Payment Management</h3>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="partial">
            Partially Paid ({partiallyPaidOrders.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Fully Paid ({fullyPaidOrders.length})
          </TabsTrigger>
          <TabsTrigger value="adjustment">
            Adjustment ({adjustmentOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {renderOrderList(pendingOrders, 'No pending payments')}
        </TabsContent>

        <TabsContent value="partial" className="mt-6">
          {renderOrderList(partiallyPaidOrders, 'No partially paid orders')}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          {renderOrderList(fullyPaidOrders, 'No fully paid orders yet')}
        </TabsContent>

        <TabsContent value="adjustment" className="mt-6">
          {renderOrderList(adjustmentOrders, 'No adjustment settlement orders')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
