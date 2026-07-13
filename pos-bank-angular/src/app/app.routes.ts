import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { environment } from '../env/environment';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{
		path: 'dashboard',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'mfeDashboard',
        remoteEntry: environment.mfeDashboardUrl,
        exposedModule: './DashboardRoute'
      }).then((m) => m.routes)
	},
  {
    path: 'transactions',
    loadChildren: () => 
      import('./transactions/transactions-routing.routes')
        .then(m => m.routes)
  },
  { path: '**', redirectTo: '/dashboard' }
];
