import { inject, Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects roues that requires authentication.
// If user is not logged in, redirects to /login.

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn()) {
    return true;
  }

  // Not logged in - redirect to login pafe
  router.navigate(['/login']);
  return false;
};

