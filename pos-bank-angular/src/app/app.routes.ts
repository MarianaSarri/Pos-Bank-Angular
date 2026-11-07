import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { environment } from '../env/environment';
import { authGuard, authMatchGuard } from './core/auth.guard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
	{
		path: 'dashboard',
    canMatch: [authMatchGuard],
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'mfeDashboard',
        remoteEntry: environment.mfeDashboardUrl,
        exposedModule: './DashboardRoute'
      }).then((m) => m.routes)
	},
  {
    path: 'transactions',
    canMatch: [authMatchGuard],
    canActivate: [authGuard],
    data: { preload: true },
    loadChildren: () => 
      import('./transactions/transactions-routing.routes')
        .then(m => m.routes)
  },
  { path: '**', redirectTo: '/dashboard' }
];
