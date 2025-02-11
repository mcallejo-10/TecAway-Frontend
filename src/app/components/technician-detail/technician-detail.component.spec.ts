import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TechnicianDetailComponent } from './technician-detail.component';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';

describe('TechnicianDetailComponent', () => {
  let component: TechnicianDetailComponent;
  let fixture: ComponentFixture<TechnicianDetailComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getUserById', 'getUserInfo']);
    
    const mockUser: User = {
      id_user: 1,
      email: 'test.user@test.com',
      password: 'TestPass123',
      name: 'Test User Name',
      roles: ['user'],
      title: 'This is a valid title that meets the minimum length requirement of 20 chars',
      description: 'This is a valid description that meets the minimum length requirement of 30 characters',
      town: 'Barcelona',
      can_move: false
    };

    // Configurar ambos mocks
    userServiceMock.getUserById.and.returnValue(of(mockUser));
    userServiceMock.getUserInfo.and.returnValue(of({
      data: {
        userKnowledges: [],
        userProjects: []
      }
    }));

    await TestBed.configureTestingModule({
      imports: [
        TechnicianDetailComponent,
        CommonModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicianDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    tick();
  }));
});
