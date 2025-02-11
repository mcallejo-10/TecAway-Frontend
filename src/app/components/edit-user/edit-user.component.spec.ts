import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditUserComponent } from './edit-user.component';
import { UserService } from '../../services/userService/user.service';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getUser', 'updateUser', 'uploadPhoto']);
    
    // Configurar retornos mock
    userServiceMock.getUser.and.returnValue(of({
        email: 'test.user@test.com',  // Email válido
        password: 'TestPassword123!',
        name: 'Test User Name',  // Al menos 2 caracteres, solo letras
        roles: ['user'],
        title: 'This is a valid title that meets the minimum length requirement of 20 chars',  // Entre 20-130 caracteres
        description: 'This is a valid description that meets the minimum length requirement of 30 characters and provides meaningful information about the user',  // Entre 30-2400 caracteres
        town: 'Barcelona',  // Al menos 2 caracteres
        can_move: false
    }));

    await TestBed.configureTestingModule({
      imports: [
        EditUserComponent,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
