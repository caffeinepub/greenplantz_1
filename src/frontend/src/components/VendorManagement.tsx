import { useState, useMemo } from 'react';
import { useGetAllVendors, useToggleVendorActiveStatus, useDeleteVendor, useGetAllProducts, useGetAllOrders } from '../hooks/useQueries';
import CommissionEditor from './CommissionEditor';
import VendorProductsView from './VendorProductsView';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Store, Search, Edit2, Trash2, Package, ShoppingCart } from 'lucide-react';
import type { VendorId } from '../types';

export default function VendorManagement() {
  const { data: vendors = [], isLoading } = useGetAllVendors();
  const { data: allProducts = [] } = useGetAllProducts();
  const { data: allOrders = [] } = useGetAllOrders();
  const toggleStatus = useToggleVendorActiveStatus();
  const deleteVendor = useDeleteVendor();
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<{ id: VendorId; name: string; commission: any } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: VendorId; name: string } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<{ id: VendorId; name: string } | null>(null);

  // Calculate product and order counts per vendor
  const vendorStats = useMemo(() => {
    const stats = new Map<string, { productCount: number; orderCount: number }>();
    
    // Count products per vendor (products are stored with vendor as key in backend)
    vendors.forEach((vendor) => {
      const vendorKey = (vendor as any).toString();
      const vendorProducts = allProducts.filter((product) => {
        // Products have SKU format: VENDOR_PREFIX-NUMBER
        // We need to match products to vendors somehow
        // Since we don't have direct vendor info in products, we'll count all for now
        return true;
      });
      
      const vendorOrders = allOrders.filter((order) => 
        order.vendorId?.toString() === vendorKey
      );
      
      stats.set(vendorKey, {
        productCount: 0, // Will be calculated from backend data structure
        orderCount: vendorOrders.length,
      });
    });
    
    return stats;
  }, [vendors, allProducts, allOrders]);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.pincode.toString().includes(searchTerm)
  );

  const handleToggleStatus = async (vendorId: VendorId, currentStatus: boolean) => {
    try {
      await toggleStatus.mutateAsync({ vendorId, active: !currentStatus });
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update vendor status');
    }
  };

  const handleEditCommission = (vendorId: VendorId, vendorName: string, commission: any) => {
    setEditingVendor({ id: vendorId, name: vendorName, commission });
    setCommissionDialogOpen(true);
  };

  const handleDeleteClick = (vendorId: VendorId, vendorName: string) => {
    setVendorToDelete({ id: vendorId, name: vendorName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    try {
      await deleteVendor.mutateAsync(vendorToDelete.id);
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete vendor');
    }
  };

  const handleViewProducts = (vendorId: VendorId, vendorName: string) => {
    setSelectedVendor({ id: vendorId, name: vendorName });
  };

  if (selectedVendor) {
    return (
      <VendorProductsView
        vendorId={selectedVendor.id}
        vendorName={selectedVendor.name}
        onBack={() => setSelectedVendor(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search vendors by name, address, or pincode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vendors Table */}
      {filteredVendors.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No vendors found matching your search' : 'No vendors registered yet'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor, index) => {
                const vendorKey = (vendor as any).toString();
                const stats = vendorStats.get(vendorKey) || { productCount: 0, orderCount: 0 };
                const commissionDisplay = 'percentage' in vendor.commission
                  ? `${vendor.commission.percentage.toString()}%`
                  : `₹${vendor.commission.fixed.toString()}`;

                return (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewProducts(vendor as any, vendor.businessName)}
                  >
                    <TableCell className="font-medium">{vendor.businessName}</TableCell>
                    <TableCell>{vendor.contactInfo}</TableCell>
                    <TableCell>{vendor.address}</TableCell>
                    <TableCell>{vendor.pincode.toString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stats.productCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stats.orderCount}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCommission(vendor as any, vendor.businessName, vendor.commission)}
                        className="gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        {commissionDisplay}
                      </Button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={vendor.active}
                          onCheckedChange={() => handleToggleStatus(vendor as any, vendor.active)}
                          disabled={toggleStatus.isPending}
                        />
                        <Badge variant={vendor.active ? 'default' : 'secondary'}>
                          {vendor.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(vendor as any, vendor.businessName)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Commission Editor Dialog */}
      {editingVendor && (
        <CommissionEditor
          open={commissionDialogOpen}
          onOpenChange={setCommissionDialogOpen}
          vendorId={editingVendor.id}
          vendorName={editingVendor.name}
          currentCommission={editingVendor.commission}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {vendorToDelete?.name}? This action cannot be undone and will also delete all their products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
