import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/userService/user.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let userServiceMock: any;
  let toastrMock: any;
  let router: Router;

  beforeEach(async () => {
    // PASO 1: Crear mocks con Jest
    authServiceMock = {
      registerUser: jest.fn(),
      checkAuthStatus: jest.fn(),
      loginUser: jest.fn()
    };

    userServiceMock = {
      checkEmailExists: jest.fn(),
      uploadPhoto: jest.fn()
    };

    toastrMock = {
      success: jest.fn(),
      error: jest.fn()
    };

    // Configurar retornos por defecto
    authServiceMock.registerUser.mockReturnValue(of({}));
    authServiceMock.checkAuthStatus.mockReturnValue(of(false));
    authServiceMock.loginUser.mockReturnValue(of(undefined));
    userServiceMock.checkEmailExists.mockReturnValue(of(false));
    userServiceMock.uploadPhoto.mockReturnValue(of({ photoUrl: 'http://example.com/photo.jpg' }));

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        // Importar ToastrModule para que las notificaciones funcionen en tests
        ToastrModule.forRoot({
          timeOut: 2000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        })
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // PASO 2: Tests de inicialización
  describe('Initialization', () => {
    it('should start at step 1', () => {
      expect(component.currentStep).toBe(1);
    });

    it('should initialize with empty form', () => {
      expect(component.registerForm.get('name')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
    });

    it('should initialize character counters at 0', () => {
      expect(component.charCountTitle).toBe(0);
      expect(component.charCountDescription).toBe(0);
    });
  });

  // PASO 3: Tests de validación del formulario (Step 1)
  describe('Form validation - Step 1', () => {
    describe('name field', () => {
      it('should be invalid when empty', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('');
        expect(nameControl?.hasError('required')).toBe(true);
      });

      it('should be invalid with numbers', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('John123');
        expect(nameControl?.hasError('pattern')).toBe(true);
      });

      it('should be valid with accented characters', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('José María');
        expect(nameControl?.valid).toBe(true);
      });
    });

    describe('password field', () => {
      it('should require at least one uppercase letter', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('lowercase123');
        expect(passwordControl?.hasError('pattern')).toBe(true);
        
        passwordControl?.setValue('Password123');
        expect(passwordControl?.valid).toBe(true);
      });

      it('should require minimum 4 characters', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('P1');
        expect(passwordControl?.hasError('minlength')).toBe(true);
      });
    });

    describe('confirmPassword and MustMatch validator', () => {
      it('should fail when passwords do not match', () => {
        component.registerForm.patchValue({
          password: 'Password123',
          confirmPassword: 'Different123'
        });
        
        // El validador MustMatch añade error a confirmPassword, no al form group
        const confirmPasswordControl = component.registerForm.get('confirmPassword');
        expect(confirmPasswordControl?.errors?.['mustMatch']).toBe(true);
      });

      it('should pass when passwords match', () => {
        component.registerForm.patchValue({
          password: 'Password123',
          confirmPassword: 'Password123'
        });
        
        const confirmPasswordControl = component.registerForm.get('confirmPassword');
        expect(confirmPasswordControl?.errors).toBeNull();
      });
    });

    describe('acceptPrivacyPolicy field', () => {
      it('should be invalid when not checked', () => {
        const policyControl = component.registerForm.get('acceptPrivacyPolicy');
        policyControl?.setValue(false);
        expect(policyControl?.hasError('required')).toBe(true);
      });

      it('should be valid when checked', () => {
        const policyControl = component.registerForm.get('acceptPrivacyPolicy');
        policyControl?.setValue(true);
        expect(policyControl?.valid).toBe(true);
      });
    });
  });

  // PASO 4: Tests de navegación entre pasos
  describe('Step navigation', () => {
    describe('nextStep', () => {
      it('should show error if first step is invalid', () => {
        // Formulario vacío = inválido
        component.nextStep();
        
        expect(component.errorMessage).toBe('Por favor, completa todos los campos requeridos y acepta la política de privacidad');
        expect(component.currentStep).toBe(1);
      });

      it('should check email existence when first step is valid', () => {
        // Llenar correctamente el paso 1
        component.registerForm.patchValue({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          acceptPrivacyPolicy: true
        });
        
        // Marcar como touched (requisito del validateFirstStep)
        ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'].forEach(field => {
          component.registerForm.get(field)?.markAsTouched();
        });

        userServiceMock.checkEmailExists.mockReturnValue(of(false));

        component.nextStep();

        expect(userServiceMock.checkEmailExists).toHaveBeenCalledWith({ 
          email: 'john@example.com' 
        });
        expect(component.currentStep).toBe(2);
        expect(component.errorMessage).toBe('');
      });

      it('should show error if email already exists', () => {
        component.registerForm.patchValue({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          acceptPrivacyPolicy: true
        });
        
        ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'].forEach(field => {
          component.registerForm.get(field)?.markAsTouched();
        });

        userServiceMock.checkEmailExists.mockReturnValue(of(true));

        component.nextStep();

        expect(component.errorMessage).toBe('Este email ya está registrado');
        expect(component.currentStep).toBe(1);
      });

      it('should convert email to lowercase', () => {
        component.registerForm.patchValue({
          name: 'John Doe',
          email: 'JOHN@EXAMPLE.COM',
          password: 'Password123',
          confirmPassword: 'Password123',
          acceptPrivacyPolicy: true
        });
        
        ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'].forEach(field => {
          component.registerForm.get(field)?.markAsTouched();
        });

        component.nextStep();

        expect(userServiceMock.checkEmailExists).toHaveBeenCalledWith({ 
          email: 'john@example.com' 
        });
      });
    });

    describe('previousStep', () => {
      it('should go back to step 1 and clear errors', () => {
        component.currentStep = 2;
        component.errorMessage = 'Some error';

        component.previousStep();

        expect(component.currentStep).toBe(1);
        expect(component.errorMessage).toBe('');
      });
    });
  });

  // PASO 5: Tests de selección de archivo
  describe('onFileSelected', () => {
    it('should store selected file', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [mockFile] } };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      component.onFileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(consoleLogSpy).toHaveBeenCalledWith('=== ARCHIVO SELECCIONADO ===');
      
      consoleLogSpy.mockRestore();
    });

    it('should detect HEIC files', () => {
      const mockFile = new File(['test'], 'photo.heic', { type: 'image/heic' });
      const event = { target: { files: [mockFile] } };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      component.onFileSelected(event);

      expect(consoleLogSpy).toHaveBeenCalledWith('🍎 Archivo HEIC detectado (formato iOS)');
      
      consoleLogSpy.mockRestore();
    });
  });
});




