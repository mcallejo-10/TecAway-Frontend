import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditUserComponent } from './edit-user.component';
import { UserService } from '../../services/userService/user.service';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserResponse } from '../../interfaces/user';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getUser', 'updateUser', 'uploadPhoto']);
    
    // Updated mock to match UserResponse type
    userServiceMock.getUser.and.returnValue(of({
      code: 200,
      message: "User Detail",
      data: {
        id_user: 1,
        email: 'test.user@test.com',
        password: 'TestPass123',
        name: 'Test User',
        roles: ['user'],
        title: 'Test Title',
        description: 'Test Description',
        town: 'Test Town',
        can_move: false,
        photo: 'https://example.com/photo.jpg',
        created_at: '2025-01-20T23:30:02.000Z',
        updated_at: '2025-01-31T16:02:51.000Z'
      }
    } as UserResponse));

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
