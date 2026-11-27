import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

import { AuthService } from '../../services/authService/auth.service';
import { of, throwError } from 'rxjs'; // Para crear observables mock
import { provideRouter, Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Actualizar el mock para incluir isLogged
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'checkAuthStatus',
      'logoutUser',
      'isLogged'  // Añadir el método isLogged
    ]);

    // Configurar los retornos de los métodos mock
    authServiceMock.checkAuthStatus.and.returnValue(of(true));
    authServiceMock.logoutUser.and.returnValue(of(void 0));
    authServiceMock.isLogged.and.returnValue(false);  // Añadir retorno para isLogged

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    let router: Router;

    beforeEach(() => {
      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    });

    it('should navigate home after a successful logout', () => {
      component.logout();

      expect(authServiceMock.logoutUser).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should still navigate home when logout fails', () => {
      authServiceMock.logoutUser.and.returnValue(throwError(() => new Error('500')));

      component.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
