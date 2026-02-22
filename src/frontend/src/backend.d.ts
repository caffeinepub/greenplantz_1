import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    id: string;
    status: OrderStatus;
    paymentStatus: string;
    productId: string;
    totalAmount: bigint;
    vendorId?: Principal;
    quantity: bigint;
    customerId: Principal;
}
export interface UserProfile {
    name: string;
    role: UserRole;
    businessName?: string;
    email: string;
    phone?: string;
}
export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    stock: bigint;
    imageUrl?: string;
    vendorId: Principal;
    price: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    assigned = "assigned",
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    customer = "customer",
    vendor = "vendor"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignVendorToOrder(orderId: string, vendorId: Principal): Promise<void>;
    createOrder(order: Order): Promise<string>;
    createProduct(product: Product): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getOrder(orderId: string): Promise<Order>;
    getProduct(productId: string): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listOrders(): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    textToUserRole(text: string): Promise<UserRole>;
    updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void>;
    updateProduct(productId: string, product: Product): Promise<void>;
    userRoleToText(userRole: UserRole): Promise<string>;
}
