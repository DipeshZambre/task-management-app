import { Component, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../../services/auth.service";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  // track whether user has attempted to submit - used to show validation hints
  submitted = false;

  // Dependency inject
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // forces UI re-render after async error
  ) { }

  onSubmit(): void {
    this.submitted = true;

    // Client-side guard - don't call API if fields are empty or email is invalid
    if (!this.email.trim() || !this.password.trim() || !this.isValidEmail(this.email)) {
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.parseError(err);
        // Force Angular to re-render - errors from interceptor chain
        // can arrive outside Angular's zone and skip change detection
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

 // agar blank chhoda he aur trim karenge toh voh bilkul empty ho jaayega aur false return karega
  // Helpers for template validation hints
  get emailInvalid(): boolean {
    return this.submitted && (!this.email.trim() || !this.isValidEmail(this.email));
  }

  get passwordInvalid(): boolean {
    return this.submitted && !this.password.trim();
  }

}

