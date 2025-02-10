import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/userService/user.service';

import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['checkEmailExists']);
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'checkAuthStatus',
      'logoutUser',
      'isLogged',
      'loginUser'  // Añadir si lo usas en el componente
    ]);

    // Configurar los retornos
    authServiceMock.checkAuthStatus.and.returnValue(of(true));
    authServiceMock.logoutUser.and.returnValue(of(void 0));
    authServiceMock.isLogged.and.returnValue(false);
    userServiceMock.checkEmailExists.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        
        ReactiveFormsModule
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
