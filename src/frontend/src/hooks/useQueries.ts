import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  VendorProfile, 
  Product, 
  Order, 
  AdminProfile, 
  UserProfile, 
  Vendor, 
  VendorId, 
  OrderId, 
  CommissionType, 
  TeamMember,
  ExtendedActorInterface 
} from '../types';
import { ExternalBlob, UserRole, UpdateProductRequest } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      const role = await (actor as unknown as ExtendedActorInterface).getCallerUserRole();
      return role;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as unknown as ExtendedActorInterface).isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// Vendor Profile Queries
export function useGetCallerVendorProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VendorProfile | null>({
    queryKey: ['vendorProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).getCallerVendorProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCallerVendorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: VendorProfile) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).saveCallerVendorProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
    },
  });
}

// Product Queries
export function useGetVendorProducts(vendorId?: VendorId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['vendorProducts', vendorId?.toString()],
    queryFn: async () => {
      if (!actor || !vendorId) return [];
      return (actor as unknown as ExtendedActorInterface).getVendorProducts(vendorId);
    },
    enabled: !!actor && !actorFetching && !!vendorId,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActorInterface).getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as unknown as ExtendedActorInterface).uploadProduct(product);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
    },
    onError: (error: any) => {
      console.error('Product upload error:', error);
      throw error;
    },
  });
}

export function useUpdateProductQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productName, newQuantity }: { productName: string; newQuantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).updateProductQuantity(productName, newQuantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
    },
  });
}

export function useToggleProductStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, productName, enabled }: { vendorId: VendorId; productName: string; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).toggleProductStatus([vendorId, productName], enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
    },
  });
}

export function useUpdateProductByAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateProductRequest) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateProductByAdmin(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
    },
  });
}

// Order Queries
export function useGetVendorOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['vendorOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActorInterface).getVendorOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActorInterface).getAllOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details, shippingAddress }: { details: string; shippingAddress: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).createOrder(details, shippingAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useAssignVendorToOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, vendorId }: { orderId: OrderId; vendorId: VendorId }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).assignVendorToOrder(orderId, vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
  });
}

export function useUpdateOrderShipping() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, trackingInfo }: { orderId: OrderId; trackingInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).updateOrderShipping(orderId, trackingInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: OrderId; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).updatePaymentStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
  });
}

// Admin Profile Queries
export function useGetCallerAdminProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminProfile | null>({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).getCallerAdminProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCallerAdminProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: AdminProfile) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).saveCallerAdminProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    },
  });
}

// Vendor Management Queries
export function useGetAllVendors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Vendor[]>({
    queryKey: ['allVendors'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActorInterface).getAllVendors();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useToggleVendorActiveStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, active }: { vendorId: VendorId; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).toggleVendorActiveStatus(vendorId, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVendors'] });
    },
  });
}

export function useDeleteVendor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: VendorId) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).deleteVendor(vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVendors'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
    },
  });
}

export function useSetVendorCommission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, commission }: { vendorId: VendorId; commission: CommissionType }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).setVendorCommission(vendorId, commission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVendors'] });
    },
  });
}

export function useFindAvailableVendors() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ pincode, productName }: { pincode: bigint; productName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).findAvailableVendors(pincode, productName);
    },
  });
}

// Team Member Queries
export function useGetAllTeamMembers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TeamMember[]>({
    queryKey: ['allTeamMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ExtendedActorInterface).getAllTeamMembers();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useTeamMembers = useGetAllTeamMembers;

export function useCreateTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, name, position, email }: { memberId: Principal; name: string; position: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).createTeamMember(memberId, name, position, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
    },
  });
}

export function useUpdateTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, name, position, email, active }: { memberId: Principal; name: string; position: string; email: string; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).updateTeamMember(memberId, name, position, email, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
    },
  });
}

// Alias for backward compatibility
export const useToggleTeamMemberStatus = useUpdateTeamMember;

export function useDeleteTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).deleteTeamMember(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTeamMembers'] });
    },
  });
}
