import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Keep behavior simple: non-admins get redirected to the home page.
  if (auth.isAdmin) return true;
  return router.createUrlTree(['/']);
};

