import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/userService/user.service';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['registerUser', 'checkAuthStatus']);
    userServiceMock = jasmine.createSpyObj('UserService', ['checkEmailExists', 'uploadPhoto']);
    
    // Configurar retornos inmediatos para evitar timeouts
    authServiceMock.registerUser.and.returnValue(of({}));
    authServiceMock.checkAuthStatus.and.returnValue(of(false));
    userServiceMock.checkEmailExists.and.returnValue(of(false));
    userServiceMock.uploadPhoto.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RegisterComponent,
        ReactiveFormsModule,
        ToastrModule.forRoot({
          timeOut: 2000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        })
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    tick(); // Esperar a que se completen las operaciones asíncronas
    expect(component).toBeTruthy();
    tick(); // Limpiar cualquier tarea pendiente
  }));
});




