import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserInfoComponent } from './user-info.component';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../../interfaces/user';
import { configureAngularTestingModule } from '../../../testing/angular-test-helpers';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    configureAngularTestingModule();
    
    userServiceMock = jasmine.createSpyObj('UserService', ['getUser', 'getUserInfo']);
    // Mock para getUserInfo
    userServiceMock.getUserInfo.and.returnValue(of({
      code: 1,
      message: "Datos obtenidos correctamente",
      data: {
        id: 1,
        name: "Test User",
        email: "test@test.com",
        title: "Test Title",
        description: "Test Description",
        town: "Test Town",
        can_move: 1,
        sections: [
          {
            section_name: "Test Section",
            section_knowledges: [
              {
                knowledge_name: "Test Knowledge"
              }
            ]
          }
        ]
      }
    }));

    // Mock for getUser with correct API response structure
    // Mock for getUser with UserResponse type
    userServiceMock.getUser.and.returnValue(of<UserResponse>({
      code: 200,
      message: "User Detail",
      data: {
        id_user: 1,
        email: 'test@test.com',
        password: 'hashedPassword123',
        name: 'Test User',
        title: 'Test Title',
        description: 'Test Description',
        town: 'Test Town',
        can_move: true,
        photo: 'https://example.com/photo.jpg',
        roles: ['user'],
        created_at: '2025-01-20T23:30:02.000Z',
        updated_at: '2025-01-31T16:02:51.000Z'
      }
    } as UserResponse));

    await TestBed.configureTestingModule({
      imports: [
        UserInfoComponent,
        CommonModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    tick();
  }));
});
