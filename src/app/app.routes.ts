// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { ReportsComponent } from './components/reports/reports.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component'; // <--- NOVO IMPORT

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    component: TransactionsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'currency',
    component: CurrencyComponent,
    canActivate: [authGuard]
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'user-settings', // <--- NOVA ROTA PARA CONFIGURAÇÕES DO USUÁRIO
    component: UserSettingsComponent,
    canActivate: [authGuard] // Protegida por autenticação
  },
  { path: '**', redirectTo: '/login' }
];
