import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  // keys used to store data in localStorage
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient) {}

  // Call POST /api/auth/register
  // data = variable and RegisterRequest is datatype joki RegisterRequest model ke through yaha par expose kiya gaya he
  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>('${this.apiUrl}/auth/register', data);
  }

  // Call POST /api/auth/login and store token + user on success
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('${this.apiUrl}/auth/login', data).pipe(
      tap(Response => {
        // Store token and user info for use across the app
        localStorage.setItem(this.TOKEN_KEY, Response.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(Response.user));
      })
    );
  }

  // LogOut, Clear stored data on logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Returns the stored JWT access token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
