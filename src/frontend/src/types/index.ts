import type { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// Type aliases
export type VendorId = Principal;
export type OrderId = bigint;
export type Pincode = bigint;

// Commission Type
export type CommissionType = 
  | { percentage: bigint }
  | { fixed: bigint };

// User Profile
export interface UserProfile {
  name: string;
  userType: string;
  email: string;
}

// Vendor Profile
export interface VendorProfile {
  businessName: string;
  contactInfo: string;
  address: string;
  pincode: Pincode;
}

// Vendor
export interface Vendor {
  businessName: string;
  contactInfo: string;
  address: string;
  pincode: Pincode;
  active: boolean;
  commission: CommissionType;
}

// Product
export interface Product {
  name: string;
  description: string;
  priceRupees: bigint;
  quantity: bigint;
  photos: ExternalBlob[];
  enabled: boolean;
  sku: string;
}

// Order
export interface Order {
  id: OrderId;
  vendorId: VendorId | null;
  details: string;
  shippingAddress: string;
  trackingInfo: string | null;
  paymentStatus: string;
}

// Admin Profile
export interface AdminProfile {
  name: string;
  email: string;
}

// Team Member
export interface TeamMember {
  id: Principal;
  name: string;
  position: string;
  email: string;
  active: boolean;
}

// Extended Actor Interface
export interface ExtendedActorInterface {
  // User Profile
  getCallerUserProfile(): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  
  // Vendor Profile
  getCallerVendorProfile(): Promise<VendorProfile | null>;
  saveCallerVendorProfile(profile: VendorProfile): Promise<void>;
  
  // Products
  getVendorProducts(vendorId: VendorId): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  uploadProduct(product: Product): Promise<void>;
  updateProductQuantity(productName: string, newQuantity: bigint): Promise<void>;
  toggleProductStatus(key: [VendorId, string], enabled: boolean): Promise<void>;
  
  // Orders
  getVendorOrders(): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(details: string, shippingAddress: string): Promise<OrderId>;
  assignVendorToOrder(orderId: OrderId, vendorId: VendorId): Promise<void>;
  updateOrderShipping(orderId: OrderId, trackingInfo: string): Promise<void>;
  updatePaymentStatus(orderId: OrderId, status: string): Promise<void>;
  
  // Admin Profile
  getCallerAdminProfile(): Promise<AdminProfile | null>;
  saveCallerAdminProfile(profile: AdminProfile): Promise<void>;
  
  // Vendors
  getAllVendors(): Promise<Vendor[]>;
  findVendorsByPincode(pincode: bigint): Promise<VendorId[]>;
  findAvailableVendors(pincode: bigint, productName: string): Promise<VendorId[]>;
  toggleVendorActiveStatus(vendorId: VendorId, active: boolean): Promise<void>;
  deleteVendor(vendorId: VendorId): Promise<void>;
  setVendorCommission(vendorId: VendorId, commission: CommissionType): Promise<void>;
  
  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(memberId: Principal, name: string, position: string, email: string): Promise<void>;
  updateTeamMember(memberId: Principal, name: string, position: string, email: string, active: boolean): Promise<void>;
  deleteTeamMember(memberId: Principal): Promise<void>;
  
  // Authorization
  getCallerUserRole(): Promise<string>;
  isCallerAdmin(): Promise<boolean>;
  assignCallerUserRole(user: Principal, role: string): Promise<void>;
}
