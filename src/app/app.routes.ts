import { Routes } from '@angular/router';
import { Login } from './core/features/auth/login/login';
import { Register } from './core/features/auth/register/register';
import { Dashboard } from './core/features/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [

// Default redirect
{ path: '', redirectTo: 'login', pathMatch: 'full'},

 // Public  routes - noAuthGuard redirects logged-in users to dashboard
{path: 'login', component: Login, canActivate: [noAuthGuard]},
{path: 'register', component: Register, canActivate: [noAuthGuard]},

// Protected route - authGuard blocks unauthenticated users
{path: 'dashboard', component: Dashboard, canActivate: [authGuard]},

// Catch-all fallback
{path: '**', redirectTo: 'login'}

];
