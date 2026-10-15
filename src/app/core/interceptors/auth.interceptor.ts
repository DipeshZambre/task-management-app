import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Auth endpoints should never trigger refresh/auto-logout.
// A 401 on /auth/login simply means wrong credentials, not an expired session.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/revoke-token'];

const isAuthEndpoint = (url: string): boolean =>
  AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));

// Ek hi refresh request in-flight rahe. Agar 5 requests ek saath 401 khayein,
// toh sab isi ek refresh ka wait karti hain (rotation ki wajah se zaroori:
// doosri refresh call purana, already-revoked token bhejti).
let refresh$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // HttpRequest objects are immutable, so clone before modifying.
  const withToken = (r: HttpRequest<unknown>, token: string | null) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  const forceLogout = () => {
    authService.logout();
    router.navigate(['/login']);
  };

  return next(withToken(req, authService.getToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      // Sirf protected endpoints ke 401 par refresh try karo
      if (err.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      // Refresh token hi nahi hai -> seedha login par bhejo
      if (!authService.getRefreshToken()) {
        forceLogout();
        return throwError(() => err);
      }

      // Refresh sirf ek baar start ho, baaki requests usi ko share karein
      refresh$ ??= authService.refreshToken().pipe(
        map(res => res.accessToken),
        finalize(() => (refresh$ = null)),
        shareReplay(1)
      );

      return refresh$.pipe(
        // Refresh fail hua (expired/revoked) -> tabhi logout
        catchError(refreshErr => {
          forceLogout();
          return throwError(() => refreshErr);
        }),
        // Refresh pass hua -> naye token ke saath original request retry
        switchMap(newToken => next(withToken(req, newToken)))
      );
    })
  );
};