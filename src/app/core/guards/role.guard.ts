import { inject, Inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";


// Factory function - call with alowed roles to create a role-specific guard.
// usage in route: canActivate: [roleGuard(['Admin', 'Manager'])]

export const roleGuard = (p0: RouterStateSnapshot | ActivatedRouteSnapshot, allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getRole();

    // check if user's role is in the allowed list
    if(userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    // Logged in but wrong role - send back to dashboard
    router.navigate(['/dashboard']);
    return false;
  };
};
