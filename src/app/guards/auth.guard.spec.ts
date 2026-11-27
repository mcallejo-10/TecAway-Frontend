import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/authService/auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  let authServiceMock: { checkAuthStatus: jest.Mock };
  let router: Router;

  const runGuard = () =>
    firstValueFrom(executeGuard(route, state) as Observable<boolean>);

  beforeEach(() => {
    authServiceMock = { checkAuthStatus: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when the user is authenticated', async () => {
    authServiceMock.checkAuthStatus.mockReturnValue(of({ authenticated: true }));

    await expect(runGuard()).resolves.toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when the user is not authenticated', async () => {
    authServiceMock.checkAuthStatus.mockReturnValue(of({ authenticated: false }));

    await expect(runGuard()).resolves.toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when the auth check fails', async () => {
    authServiceMock.checkAuthStatus.mockReturnValue(throwError(() => new Error('401')));

    await expect(runGuard()).resolves.toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
