import { inject, Inject } from "@angular/core";
import { CanActivateFn, CanDeactivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";


// Prevents already-authenticated users from accessing login/register pages.
// If logged in, redirects straight to /dashboard.

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(!authService.isLoggedIn())
  {
    return true;
  }

  // Already logged in - saved to dashboard
  router.navigate(['/dashboard']);
  return false;
};
