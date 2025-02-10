import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

import { AuthService } from '../../services/authService/auth.service';
import { of } from 'rxjs'; // Para crear observables mock
import { provideRouter } from '@angular/router';

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
});
