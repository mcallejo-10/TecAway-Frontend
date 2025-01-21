import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './auth.service.guard'; // Asegúrate de que este path sea correcto

export const authGuard: CanActivateFn = (route, state) => {
  const authGuard = inject(AuthGuard);
  return authGuard.canActivate();
};
