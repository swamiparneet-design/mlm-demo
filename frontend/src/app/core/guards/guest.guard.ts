import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Keeps already-logged-in users from seeing the login/register screens again. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasValidSession()) {
    return true;
  }

  return router.createUrlTree([auth.isAdmin() ? '/admin/dashboard' : '/app/dashboard']);
};
