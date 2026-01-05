import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/userService/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { TEST_CREDENTIALS, TEST_USERS } from '../../../testing/test-constants';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    const isLoggedSignal = signal(false);

    userServiceMock = {
      checkEmailExists: jest.fn()
    };

    authServiceMock = {
      checkAuthStatus: jest.fn(),
      logoutUser: jest.fn(),
      isLogged: isLoggedSignal,  // Signal que simula el estado de autenticación
      loginUser: jest.fn(),
      isLoggedIn: jest.fn()
    };

    authServiceMock.checkAuthStatus.mockReturnValue(of(true));
    authServiceMock.logoutUser.mockReturnValue(of(void 0));
    userServiceMock.checkEmailExists.mockReturnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    
    // JEST: jest.spyOn en lugar de spyOn para espiar métodos del router
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should initialize with an empty form', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should validate email as required', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate password as required', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });
  });

  describe('checkEmailLogin', () => {
    it('should check if email exists and set userExist to true when user exists', () => {
      // JEST: mockReturnValue para configurar el retorno
      userServiceMock.checkEmailExists.mockReturnValue(of(true));
      component.loginForm.get('email')?.setValue('test@example.com');

      component.checkEmailLogin();

      // Las expectativas son iguales en Jest y Jasmine
      expect(userServiceMock.checkEmailExists).toHaveBeenCalledWith({ 
        email: 'test@example.com' 
      });
      expect(component.userExist).toBe(true);
      expect(component.isValidEmail).toBe(true);
    });

    it('should navigate to register when user does not exist', () => {
      userServiceMock.checkEmailExists.mockReturnValue(of(false));
      component.loginForm.get('email')?.setValue('newuser@example.com');

      component.checkEmailLogin();

      expect(component.userExist).toBe(false);
      expect(component.isValidEmail).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/registro']);
    });

    it('should convert email to lowercase', () => {
      userServiceMock.checkEmailExists.mockReturnValue(of(true));
      component.loginForm.get('email')?.setValue('TEST@EXAMPLE.COM');

      component.checkEmailLogin();

      expect(userServiceMock.checkEmailExists).toHaveBeenCalledWith({ 
        email: 'test@example.com' 
      });
    });

    it('should handle error when checking email', () => {
      // JEST: mockReturnValue con throwError para simular errores
      userServiceMock.checkEmailExists.mockReturnValue(
        throwError(() => 'Error al verificar email')
      );
      component.loginForm.get('email')?.setValue('test@example.com');

      component.checkEmailLogin();

      expect(component.isValidEmail).toBe(false);
      expect(component.errorMessage).toBe('Error al verificar email');
    });
  });

  describe('userLogin', () => {
    beforeEach(() => {
      component.loginForm.get('email')?.setValue(TEST_USERS.EMAIL);
      component.loginForm.get('password')?.setValue(TEST_CREDENTIALS.VALID_PASSWORD);
    });

    it('should login user successfully and navigate to account', () => {
      authServiceMock.loginUser.mockReturnValue(of(undefined));

      component.userLogin();

      expect(authServiceMock.loginUser).toHaveBeenCalledWith({
        email: TEST_USERS.EMAIL,
        password: TEST_CREDENTIALS.VALID_PASSWORD
      });
      expect(router.navigate).toHaveBeenCalledWith(['/tu-cuenta']);
    });

    it('should convert email to lowercase on login', () => {
      authServiceMock.loginUser.mockReturnValue(of(undefined));
      component.loginForm.get('email')?.setValue(TEST_USERS.EMAIL_UPPERCASE);

      component.userLogin();

      expect(authServiceMock.loginUser).toHaveBeenCalledWith({
        email: TEST_USERS.EMAIL,
        password: TEST_CREDENTIALS.VALID_PASSWORD
      });
    });

    it('should handle login error with message', () => {
      const error = { error: { message: 'Credenciales inválidas' } };
      authServiceMock.loginUser.mockReturnValue(throwError(() => error));

      component.userLogin();

      expect(component.errorMessage).toBe('Credenciales inválidas');
    });

    it('should handle login error without message', () => {
      authServiceMock.loginUser.mockReturnValue(throwError(() => ({})));

      component.userLogin();

      expect(component.errorMessage).toBe('Error en login');
    });
  });
});
