# Specification

## Summary
**Goal:** Create a comprehensive admin dashboard for vendor and product management with viewing, editing, and status control capabilities.

**Planned changes:**
- Add vendor overview section displaying all vendors with their business details, product counts, order counts, and enable/disable toggles
- Implement drill-down view to display all products for a selected vendor with full product details and photos
- Add product editing functionality allowing admin to modify product fields (name, description, price, quantity, photos)
- Sync admin-edited product changes so vendors see updates in their dashboard
- Create backend updateProductByAdmin function with admin authorization validation
- Build ProductEditDialog component with pre-filled form fields and photo management
- Add useUpdateProductByAdmin React Query mutation hook with automatic cache invalidation

**User-visible outcome:** Admin can view all vendors and their products in a centralized dashboard, toggle vendor status on/off, drill into individual vendor product lists, and edit any product with changes automatically visible to the original vendor.
