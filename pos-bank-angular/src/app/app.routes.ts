import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./pages/transactions/transactions.module').then((m) => m.TransactionsModule),
  },
  { path: '**', redirectTo: '/dashboard' }
];
