import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { User } from '../../interfaces/user';
import { LoginRequest } from '../../interfaces/login';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginUser', () => {
    it('should login user successfully and set isLogged to true', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = { success: true, message: 'Login exitoso' };

      service.loginUser(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.isLoggedIn()).toBe(true);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockResponse);
    });

    it('should handle login error and set isLogged to false', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };
      const mockError = { 
        status: 401, 
        statusText: 'Unauthorized',
        error: { message: 'Credenciales inválidas' }
      };

      service.loginUser(mockLoginRequest).subscribe({
        next: () => {
          fail('Should have failed with 401 error');
        },
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          expect(service.isLoggedIn()).toBe(false);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);

      req.flush(mockError.error, { 
        status: mockError.status, 
        statusText: mockError.statusText 
      });
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully and clear session', () => {
      service.isLogged.set(true); // Usuario inicialmente logueado
      const mockResponse = { success: true, message: 'Logout exitoso' };

      service.logoutUser().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.isLoggedIn()).toBe(false);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/logout');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockResponse);
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when user is not logged in', () => {
      service.isLogged.set(false);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when user is logged in', () => {
      service.isLogged.set(true);
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('checkAuthStatus', () => {
    it('should check auth status and set isLogged to true when authenticated', () => {
      const mockResponse = { authenticated: true, user: { id: 1, email: 'user@test.com' } };

      service.checkAuthStatus().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.isLoggedIn()).toBe(true);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/check-auth');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockResponse);
    });

    it('should handle auth check error and set isLogged to false', () => {
      const mockError = { 
        status: 401, 
        statusText: 'Unauthorized',
        error: { message: 'Token expirado' }
      };

      service.checkAuthStatus().subscribe({
        next: () => {
          fail('Should have failed with 401 error');
        },
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          expect(service.isLoggedIn()).toBe(false);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/check-auth');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockError.error, { 
        status: mockError.status, 
        statusText: mockError.statusText 
      });
    });
  });

  describe('registerUser', () => {
    it('should register user successfully and set isLogged to false', () => {
      const mockUser: User = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'Test User',
        title: 'Developer',
        description: 'A test user for registration',
        town: 'Test City',
        can_move: true,
        roles: ['user']
      };
      const mockResponse = { success: true, message: 'Usuario registrado exitosamente' };

      service.registerUser(mockUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.isLoggedIn()).toBe(false); // Registro no logea automáticamente
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockResponse);
    });

    it('should handle registration error', () => {
      const mockUser: User = {
        email: 'existing@test.com', // Email que ya existe
        password: 'password123',
        name: 'Test User',
        title: 'Developer',
        description: 'A test user',
        town: 'Test City',
        can_move: false,
        roles: ['user']
      };
      const mockError = { 
        status: 409, 
        statusText: 'Conflict',
        error: { message: 'El email ya está registrado' }
      };

      service.registerUser(mockUser).subscribe({
        next: () => {
          fail('Should have failed with 409 error');
        },
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.statusText).toBe('Conflict');
          expect(service.isLoggedIn()).toBe(false);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockError.error, { 
        status: mockError.status, 
        statusText: mockError.statusText 
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request successfully', () => {
      const email = 'user@test.com';
      const mockResponse = { success: true, message: 'Email de recuperación enviado' };

      service.forgotPassword(email).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/forgot-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(email);

      req.flush(mockResponse);
    });

    it('should handle forgot password error', () => {
      const email = 'nonexistent@test.com';
      const mockError = { 
        status: 404, 
        statusText: 'Not Found',
        error: { message: 'Email no encontrado' }
      };

      service.forgotPassword(email).subscribe({
        next: () => {
          fail('Should have failed with 404 error');
        },
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/forgot-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(email);

      req.flush(mockError.error, { 
        status: mockError.status, 
        statusText: mockError.statusText 
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      const mockUser: User = {
        email: 'user@test.com',
        password: 'newPassword123',
        name: 'Test User',
        title: 'Developer',
        description: 'A test user',
        town: 'Test City',
        can_move: false,
        roles: ['user']
      };
      const mockResponse = { success: true, message: 'Contraseña cambiada exitosamente' };

      service.changePassword(mockUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/change-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockResponse);
    });

    it('should handle change password error', () => {
      const mockUser: User = {
        email: 'user@test.com',
        password: 'weak', // Contraseña muy débil
        name: 'Test User',
        title: 'Developer',
        description: 'A test user',
        town: 'Test City',
        can_move: false,
        roles: ['user']
      };
      const mockError = { 
        status: 400, 
        statusText: 'Bad Request',
        error: { message: 'La contraseña debe tener al menos 8 caracteres' }
      };

      service.changePassword(mockUser).subscribe({
        next: () => {
          fail('Should have failed with 400 error');
        },
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/auth/change-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockError.error, { 
        status: mockError.status, 
        statusText: mockError.statusText 
      });
    });
  });
});
