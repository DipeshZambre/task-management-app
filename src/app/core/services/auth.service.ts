import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models/auth.models';

// Response of POST /api/auth/refresh-token
// NOTE: field names backend ke RefreshTokenResponseDto se match hone chahiye
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  // Keys used to store data in localStorage
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient) {}

  // Call POST /api/auth/register
  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/auth/register`, data);
  }

  // Call POST /api/auth/login and store tokens + user on success
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(response => {
        // Store tokens and user info for use across the app
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      })
    );
  }

  // Call POST /api/auth/refresh-token with the stored refresh token.
  // Backend rotation karta hai: naya access token + naya refresh token milta hai,
  // purana refresh token revoke ho jaata hai. Isliye dono ko overwrite karna zaroori hai.
  refreshToken(): Observable<RefreshTokenResponse> {
    return this.http
      .post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh-token`, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(
        tap(res => {
          localStorage.setItem(this.TOKEN_KEY, res.accessToken);
          localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
        })
      );
  }

  // Revoke refresh token on the server, then clear stored data
  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      // Subscribe pehle hota hai (interceptor abhi access token padh leta hai),
      // uske baad niche storage clear hota hai.
      // Error ignore karte hain: server fail bhi ho, user ka local logout hona chahiye.
      this.http
        .post(`${this.apiUrl}/auth/revoke-token`, { refreshToken })
        .subscribe({ error: () => {} });
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Returns the stored JWT access token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Returns the stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  // Returns the stored user object
  getUser(): UserResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Check if user is currently logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Returns the role of the current user (Admin, Manager, User)
  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }
}