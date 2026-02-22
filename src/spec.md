# Specification

## Summary
**Goal:** Fix admin registration authorization error and access denied issue preventing authorized admin users from accessing the admin dashboard.

**Planned changes:**
- Debug and resolve the 'Access Denied' error that appears when authorized admin users attempt to access the admin dashboard
- Fix the backend record validation error 'Invalid record {name:text; role:text; businessName:opt text; email:text; phoneNumber:text}; argument field role' in the AdminRegistration.tsx authentication flow
- Verify and correct the admin authorization check logic in ProtectedAdminRoute.tsx to properly validate admin status from the backend isCallerAdmin function
- Add comprehensive error logging in AdminRegistration.tsx to capture exact backend response and error details during authentication failures

**User-visible outcome:** Authorized admin users (greenplantz2020@gmail.com and active team members) can successfully register and access the admin dashboard without encountering 'Access Denied', 'Authorization Required', or 'Registration failed' errors.
