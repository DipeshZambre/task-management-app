import { Component, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Route, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

onSubmit(): void {
    this.submitted = true;
 
    // Client-side guard — validate all fields before calling API
    if (!this.username.trim() || !this.email.trim() ||
        !this.password.trim() || !this.isValidEmail(this.email)) {
      return;
    }
 
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();
 
    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.parseError(err);
        this.cdr.detectChanges();
      }
    });
  }
 
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
 
  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot reach the server. Please check your connection.';
    }
    if (err.error?.message) {
      return err.error.message;
    }
    if (err.error?.errors) {
      const firstField = Object.keys(err.error.errors)[0];
      return err.error.errors[firstField][0];
    }
    if (err.error?.title) {
      return err.error.title;
    }
    return 'Something went wrong. Please try again.';
  }
 
  // Helpers for template validation hints
  get usernameInvalid(): boolean { return this.submitted && !this.username.trim(); }
  get emailInvalid(): boolean    { return this.submitted && (!this.email.trim() || !this.isValidEmail(this.email)); }
  get passwordInvalid(): boolean { return this.submitted && !this.password.trim(); }

}
