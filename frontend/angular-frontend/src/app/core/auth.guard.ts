import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true; // Si el usuario esta logueado, puede pasar
  }

  // Usuario no logueado, redirigir a /login
  return router.parseUrl('/login');
};