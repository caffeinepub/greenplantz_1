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
  ExtendedActorInterface,
  DeliveryStatus,
  Address
} from '../types';
import { ExternalBlob, UserRole } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useQueries] Fetching caller user profile...');
      try {
        const profile = await (actor as unknown as ExtendedActorInterface).getCallerUserProfile();
        console.log('[useQueries] Caller user profile received:', {
          hasProfile: !!profile,
          profileRole: profile?.role,
          profileName: profile?.name,
          profileEmail: profile?.email,
        });
        return profile;
      } catch (error) {
        console.error('[useQueries] Error fetching caller user profile:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
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
      console.log('[useQueries] Saving caller user profile:', {
        profileStructure: profile,
        roleType: typeof profile.role,
        roleValue: profile.role,
        hasBusinessName: !!profile.businessName,
        hasPhone: !!profile.phone,
      });
      
      try {
        await (actor as unknown as ExtendedActorInterface).saveCallerUserProfile(profile);
        console.log('[useQueries] User profile saved successfully');
      } catch (error) {
        console.error('[useQueries] Error saving user profile:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          errorName: error instanceof Error ? error.name : undefined,
          sentProfile: profile,
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useQueries] Invalidating queries after profile save');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
    onError: (error) => {
      console.error('[useQueries] Mutation error in useSaveCallerUserProfile:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
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
      console.log('[useQueries] Fetching caller user role...');
      try {
        const role = await (actor as unknown as ExtendedActorInterface).getCallerUserRole();
        console.log('[useQueries] Caller user role:', role);
        return role;
      } catch (error) {
        console.error('[useQueries] Error fetching caller user role:', error);
        throw error;
      }
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
      console.log('[useQueries] Checking if caller is admin...');
      try {
        const isAdmin = await (actor as unknown as ExtendedActorInterface).isCallerAdmin();
        console.log('[useQueries] Is caller admin result:', isAdmin);
        return isAdmin;
      } catch (error) {
        console.error('[useQueries] Error checking if caller is admin:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        // Return false instead of throwing to prevent blocking the UI
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useQueries] Assigning caller user role:', { user: user.toString(), role });
      return (actor as unknown as ExtendedActorInterface).assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      console.log('[useQueries] User role assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
    onError: (error) => {
      console.error('[useQueries] Error assigning user role:', error);
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
    retry: false,
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
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
      return (actor as unknown as ExtendedActorInterface).uploadProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProducts'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
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
    mutationFn: async ({ key, enabled }: { key: [VendorId, string]; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).toggleProductStatus(key, enabled);
    },
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
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

export function useFindVendorsByPincode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (pincode: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as unknown as ExtendedActorInterface).findVendorsByPincode(pincode);
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
