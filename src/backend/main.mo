import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();

  // User Profile Types
  public type UserRole = {
    #vendor;
    #admin;
    #customer;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : UserRole;
    businessName : ?Text;
    phone : ?Text;
  };

  // Convert UserRole to AccessControl.UserRole
  func mapToAccessControlRole(userRole : UserRole) : AccessControl.UserRole {
    switch (userRole) {
      case (#admin) { #admin };
      case (#vendor) { #user };
      case (#customer) { #user };
    };
  };

  // Convert UserRole to Text
  public query func userRoleToText(userRole : UserRole) : async Text {
    switch (userRole) {
      case (#vendor) { "vendor" };
      case (#admin) { "admin" };
      case (#customer) { "customer" };
    };
  };

  // Convert Text to UserRole
  public query func textToUserRole(text : Text) : async UserRole {
    if (text == "vendor") {
      #vendor;
    } else if (text == "admin") {
      #admin;
    } else if (text == "customer") {
      #customer;
    } else {
      Runtime.trap("Unknown user role: " # text);
    };
  };

  // Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile (admin can view all, users can only view their own)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Users can view their own profile, admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's profile with role assignment to AccessControl system
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Check if this is a new registration or profile update
    let isNewUser = switch (userProfiles.get(caller)) {
      case null { true };
      case (?_) { false };
    };

    // For new users, assign the appropriate AccessControl role
    if (isNewUser) {
      let accessControlRole = mapToAccessControlRole(profile.role);
      AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);
    } else {
      // For existing users, verify they have permission to update
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only authenticated users can save profiles");
      };

      // Check if role is being changed
      switch (userProfiles.get(caller)) {
        case (?existingProfile) {
          if (existingProfile.role != profile.role) {
            // Role change requires admin permission or self-assignment to same/lower privilege
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              // Non-admins cannot change their role
              Runtime.trap("Unauthorized: Only admins can change user roles");
            };
            // Admin is changing the role, update AccessControl
            let accessControlRole = mapToAccessControlRole(profile.role);
            AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);
          };
        };
        case null { /* Should not happen due to isNewUser check */ };
      };
    };

    // Save the profile
    userProfiles.add(caller, profile);
  };

  // Product Management Types
  public type Product = {
    id : Text;
    sku : Text;
    name : Text;
    description : Text;
    price : Nat;
    vendorId : Principal;
    imageUrl : ?Text;
    stock : Nat;
  };

  // Create product (vendors and admins only)
  public shared ({ caller }) func createProduct(product : Product) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only authenticated users can create products
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    // Check if user has vendor or admin role in their profile
    switch (userProfiles.get(caller)) {
      case null {
        Runtime.trap("Unauthorized: User profile not found");
      };
      case (?profile) {
        let isVendorOrAdmin = switch (profile.role) {
          case (#vendor) { true };
          case (#admin) { true };
          case (#customer) { false };
        };

        if (not isVendorOrAdmin) {
          Runtime.trap("Unauthorized: Only vendors and admins can create products");
        };
      };
    };

    // Verify the vendor is creating their own product or is an admin
    if (product.vendorId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create products for yourself");
    };

    products.add(product.id, product);
    product.id;
  };

  // Update product (vendor owns it or admin)
  public shared ({ caller }) func updateProduct(productId : Text, product : Product) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (products.get(productId)) {
      case null { Runtime.trap("Product not found") };
      case (?existingProduct) {
        // Only the vendor who owns the product or an admin can update it
        if (existingProduct.vendorId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own products");
        };
        products.add(productId, product);
      };
    };
  };

  // Get product (public, no auth required)
  public query func getProduct(productId : Text) : async ?Product {
    products.get(productId);
  };

  // List all products (public, no auth required)
  public query func listProducts() : async [Product] {
    let productList = products.toArray();
    productList.map<(Text, Product), Product>(func(entry) { entry.1 });
  };

  // Order Management Types
  public type OrderStatus = {
    #pending;
    #assigned;
    #paid;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Text;
    customerId : Principal;
    productId : Text;
    quantity : Nat;
    totalAmount : Nat;
    status : OrderStatus;
    vendorId : ?Principal;
    paymentStatus : Text;
  };

  // Create order (authenticated users only)
  public shared ({ caller }) func createOrder(order : Order) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };

    // Verify the customer is creating their own order
    if (order.customerId != caller) {
      Runtime.trap("Unauthorized: Can only create orders for yourself");
    };

    orders.add(order.id, order);
    order.id;
  };

  // Assign vendor to order (admin only)
  public shared ({ caller }) func assignVendorToOrder(orderId : Text, vendorId : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign vendors to orders");
    };

    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          vendorId = ?vendorId;
          status = #assigned;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Update payment status (admin or assigned vendor only)
  public shared ({ caller }) func updatePaymentStatus(orderId : Text, paymentStatus : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?order) {
        // Only admin or the assigned vendor can update payment status
        let isAuthorized = AccessControl.isAdmin(accessControlState, caller) or
          (switch (order.vendorId) {
          case (?vid) { vid == caller };
          case null { false };
          });

        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Only admins or assigned vendors can update payment status");
        };

        let updatedOrder = {
          order with
          paymentStatus = paymentStatus;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Get order (customer who created it, assigned vendor, or admin)
  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?order) {
        // Check if caller is the customer, assigned vendor, or admin
        let isAuthorized = order.customerId == caller or
          AccessControl.isAdmin(accessControlState, caller) or
          (switch (order.vendorId) {
          case (?vid) { vid == caller };
          case null { false };
          });

        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };

        order;
      };
    };
  };

  // List orders for caller (customers see their orders, vendors see assigned orders, admins see all)
  public query ({ caller }) func listOrders() : async [Order] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list orders");
    };

    let allOrders = orders.toArray();
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (isAdmin) {
      // Admins see all orders
      allOrders.map<(Text, Order), Order>(func(entry) { entry.1 });
    } else {
      // Filter orders based on user role
      let filteredOrders = allOrders.filter(
        func(entry) {
          let order = entry.1;
          // Show if user is customer or assigned vendor
          order.customerId == caller or
          (switch (order.vendorId) {
            case (?vid) { vid == caller };
            case null { false };
          });
        },
      );
      filteredOrders.map<(Text, Order), Order>(func(entry) { entry.1 });
    };
  };
};
