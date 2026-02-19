import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  type Pincode = Nat;
  public type VendorId = Principal;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type TeamMember = {
    id : Principal;
    name : Text;
    position : Text;
    email : Text;
    active : Bool;
  };

  let teamMembers = Map.empty<Principal, TeamMember>();

  public type Vendor = {
    businessName : Text;
    contactInfo : Text;
    address : Text;
    pincode : Pincode;
    active : Bool;
    commission : CommissionType;
  };

  public type CommissionType = {
    #percentage : Nat;
    #fixed : Nat;
  };

  let vendors = Map.empty<VendorId, Vendor>();

  public type Product = {
    name : Text;
    description : Text;
    priceRupees : Nat;
    quantity : Nat;
    photos : [Storage.ExternalBlob];
    enabled : Bool;
    sku : Text;
  };

  let products = Map.empty<VendorId, List.List<Product>>();

  public type OrderId = Nat;
  public type Order = {
    id : OrderId;
    vendorId : ?VendorId;
    details : Text;
    shippingAddress : Text;
    trackingInfo : ?Text;
    paymentStatus : Text;
  };

  var nextOrderId : OrderId = 0;
  let orders = Map.empty<OrderId, Order>();

  public type AdminId = Principal;
  public type AdminProfile = {
    name : Text;
    email : Text;
  };

  let adminProfiles = Map.empty<AdminId, AdminProfile>();

  public type UserProfile = {
    name : Text;
    userType : Text; // "vendor" or "admin"
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  func isAuthorizedAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email == "greenplantz2020@gmail.com") {
          return true;
        };
      };
      case (null) {};
    };

    switch (teamMembers.get(caller)) {
      case (?member) { return member.active };
      case (null) {};
    };

    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type UpdateProductRequest = {
    productId : Text;
    name : Text;
    description : Text;
    priceRupees : Nat;
    quantity : Nat;
    photos : [Storage.ExternalBlob];
    enabled : Bool;
    sku : Text;
  };

  public type ProductUpdateResult = {
    updatedProduct : Product;
    updatedProductList : List.List<Product>;
  };

  public shared ({ caller }) func updateProductByAdmin(request : UpdateProductRequest) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    var productUpdated = false;
    var foundVendorId : ?VendorId = null;

    for ((vendorId, productList) in products.entries()) {
      let filtered = productList.filter(
        func(product) { product.sku == request.productId }
      );
      if (filtered.size() > 0) {
        foundVendorId := ?vendorId;
        let updatedProductList = productList.map<Product, Product>(
          func(product) {
            if (product.sku == request.productId) {
              productUpdated := true;
              {
                product with
                name = request.name;
                description = request.description;
                priceRupees = request.priceRupees;
                quantity = request.quantity;
                photos = request.photos;
                enabled = request.enabled;
                sku = request.sku;
              };
            } else {
              product;
            };
          }
        );
        products.add(vendorId, updatedProductList);
      };
    };

    if (not productUpdated) {
      Runtime.trap("Product not found");
    };

    productUpdated;
  };
};
