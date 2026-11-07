import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { catchError, map, of, take } from 'rxjs';
import { AuthService } from './auth.service';

function authorize(url: string) {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginUrl = router.createUrlTree(['/login'], {
    queryParams: { returnUrl: url }
  });

  if (!auth.isConfigured) {
    return loginUrl;
  }

  return auth.user$.pipe(
    take(1),
    map((user) => user ? true : loginUrl),
    catchError(() => of(loginUrl))
  );
}

export const authGuard: CanActivateFn = (_route, state) => authorize(state.url);

export const authMatchGuard: CanMatchFn = (_route, segments) =>
  authorize(`/${segments.map((segment) => segment.path).join('/')}`);