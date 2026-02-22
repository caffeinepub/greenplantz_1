import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    name : Text;
    email : Text;
    role : Text;
    businessName : ?Text;
    phone : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
  };

  type NewUserRole = { #vendor; #admin; #customer };
  type NewUserProfile = {
    name : Text;
    email : Text;
    role : NewUserRole;
    businessName : ?Text;
    phone : ?Text;
  };

  // Reuse existing Product and Order types
  type Product = {
    id : Text;
    sku : Text;
    name : Text;
    description : Text;
    price : Nat;
    vendorId : Principal;
    imageUrl : ?Text;
    stock : Nat;
  };

  type Order = {
    id : Text;
    customerId : Principal;
    productId : Text;
    quantity : Nat;
    totalAmount : Nat;
    status : {
      #pending;
      #assigned;
      #paid;
      #shipped;
      #delivered;
      #cancelled;
    };
    vendorId : ?Principal;
    paymentStatus : Text;
  };

  public func migrateRole(oldRole : Text) : NewUserRole {
    if (oldRole == "vendor") { #vendor } else if (oldRole == "admin") { #admin }
    else { #customer };
  };

  public func run(old : OldActor) : {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
  } {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldProfile) {
        {
          oldProfile with
          role = migrateRole(oldProfile.role);
        };
      }
    );
    { old with userProfiles = newUserProfiles };
  };
};
