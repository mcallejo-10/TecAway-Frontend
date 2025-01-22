import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './guards/auth.guard';

export const authGuard: CanActivateFn = (route, state) => {
  const authGuard = inject(AuthGuard);
  return authGuard.canActivate();
};
