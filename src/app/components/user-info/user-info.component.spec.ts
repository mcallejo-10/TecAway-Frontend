import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInfoComponent } from './user-info.component';
import { UserService } from '../../services/userService/user.service';
import { AuthService } from '../../services/authService/auth.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authServiceMock: any;
  let router: Router;

  // Mock data basado en las interfaces reales
  const mockUserResponse = {
    data: {
      id_user: 123,
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  const mockUserInfoResponse = {
    data: {
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      title: 'Software Developer with 5 years of experience',
      description: 'Experienced developer specializing in web technologies',
      town: 'Barcelona',
      can_move: true,
      photo: 'https://example.com/photo.jpg',
      sections: [
        {
          section_name: 'Programming',
          section_knowledges: [
            { knowledge_name: 'JavaScript' },
            { knowledge_name: 'TypeScript' }
          ]
        }
      ]
    }
  };

  beforeEach(async () => {
    // Crear mocks con Jest
    userServiceMock = {
      getUser: jest.fn(),
      getUserInfo: jest.fn(),
      deleteUser: jest.fn()
    };

    const isLoggedSignal = signal(true);
    authServiceMock = {
      logoutUser: jest.fn(),
      isLogged: isLoggedSignal
    };

    // Configurar valores de retorno por defecto
    userServiceMock.getUser.mockReturnValue(of(mockUserResponse));
    userServiceMock.getUserInfo.mockReturnValue(of(mockUserInfoResponse));
    userServiceMock.deleteUser.mockReturnValue(of(undefined));
    authServiceMock.logoutUser.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UserInfoComponent],
      providers: [
        provideRouter([]),  // JEST: Proveer router para que RouterLink funcione
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load user data and user info on initialization', () => {
      // Ejecutar ngOnInit (se llama automáticamente con detectChanges)
      fixture.detectChanges();

      // Verificar que se llamaron los servicios en orden
      expect(userServiceMock.getUser).toHaveBeenCalled();
      expect(userServiceMock.getUserInfo).toHaveBeenCalledWith(123);
      
      // Verificar que se asignó el id y los datos del técnico
      expect(component.id).toBe(123);
      expect(component.technician).toEqual(mockUserInfoResponse.data);
      expect(component.loading).toBe(false);
    });

    it('should set loading to true initially', () => {
      expect(component.loading).toBe(true);
    });

    it('should handle getUserInfo error gracefully', () => {
      userServiceMock.getUserInfo.mockReturnValue(
        throwError(() => new Error('Failed to load user info'))
      );

      fixture.detectChanges();

      // El componente debería manejar el error sin crashear
      expect(component.id).toBe(123);
    });
  });

  describe('Modal management', () => {
    it('should open delete modal', () => {
      component.openDeleteModal();
      expect(component.showDeleteModal).toBe(true);
    });

    it('should close delete modal', () => {
      component.showDeleteModal = true;
      component.closeDeleteModal();
      expect(component.showDeleteModal).toBe(false);
    });
  });

  describe('deleteAccount', () => {
    beforeEach(() => {
      component.id = 123;
    });

    it('should delete account, logout and navigate to home on success', () => {
      component.deleteAccount();

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(123);
      expect(authServiceMock.logoutUser).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle delete account error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Failed to delete account');
      userServiceMock.deleteUser.mockReturnValue(throwError(() => error));

      component.deleteAccount();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting account:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });
});
