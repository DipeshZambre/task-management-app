// Interceptor Request response and error handle karta he  

import { HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import { inject, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Auth endpoints should never trigger the auto-logout redirect.
// A 401 on /auth/login simply means wrong credentials - not an expired session
const AUTH_ENDPOINTS = ['/auth/login', 'auth/register', 'auth/refresh-token'];

const isAuthEndpoint = (url: string): boolean =>
  AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));



export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Clone the request and attach Authorization header if token exists.
  // HttpRequest objects are immutable so we must clone before modifying.
  const authReq = token
  ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`}})
  : req;


 return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
        // Only auto-logout on 401 for protected endpoints.
        // Auth endpoints (login/register) handle their own errors in the component.
        if (err.status === 401 && !isAuthEndpoint(req.url)) {
            authService.logout();
            router.navigate(['/login']);
        }

        // Always re-throw so the component's error handler receives the error
        return throwError(() => err);
    })
);

};

