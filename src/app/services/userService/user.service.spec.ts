/* eslint-disable */ 

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from '../../interfaces/user';
import { UserInfoResponse } from '../../interfaces/user-info';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserList', () => {
    it('should get all users successfully', () => {
      const mockUsers: User[] = [
        {
          id_user: 1,
          email: 'user1@test.com',
          password: 'testPassword',
          name: 'Usuario 1',
          title: 'Developer',
          description: 'Test user 1',
          town: 'Madrid',
          can_move: true,
          roles: ['user']
        },
        {
          id_user: 2,
          email: 'user2@test.com',
          password: 'testPassword',
          name: 'Usuario 2',
          title: 'Designer',
          description: 'Test user 2',
          town: 'Barcelona',
          can_move: false,
          roles: ['user']
        }
      ];

      service.getUserList().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/get-all-users');
      expect(req.request.method).toBe('GET');

      req.flush(mockUsers);
    });
  });

  describe('checkEmailExists', () => {
    it('should check if email exists successfully', () => {
      const emailData = { email: 'test@example.com' };
      const mockResponse = { exists: false, message: 'Email disponible' };

      service.checkEmailExists(emailData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.exists).toBe(false);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/check-email');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(emailData);

      req.flush(mockResponse);
    });

    it('should handle email already exists', () => {
      const emailData = { email: 'existing@example.com' };
      const mockResponse = { exists: true, message: 'Email ya registrado' };

      service.checkEmailExists(emailData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.exists).toBe(true);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/check-email');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(emailData);

      req.flush(mockResponse);
    });
  });

  describe('getUser', () => {
    it('should get current user profile successfully', () => {
      const mockUserProfile: User = {
        id_user: 1,
        email: 'currentuser@test.com',
        password: 'password123',
        name: 'Usuario Actual',
        title: 'Senior Developer',
        description: 'Usuario logueado actualmente',
        town: 'Madrid',
        can_move: true,
        roles: ['user', 'admin']
      };

      service.getUser().subscribe((user: any) => {
        expect(user).toEqual(mockUserProfile);
        expect(user.email).toBe('currentuser@test.com');
        expect(user.roles).toContain('admin');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/');
      expect(req.request.method).toBe('GET');

      req.flush(mockUserProfile);
    });

    it('should handle unauthorized user error', () => {
      const mockError = {
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Usuario no autenticado' }
      };

      service.getUser().subscribe({
        next: () => {
          fail('Should have failed with 401 error');
        },
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/');
      expect(req.request.method).toBe('GET');

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', () => {
      const userId = 123;
      const mockUser: User = {
        id_user: userId,
        email: 'user123@test.com',
        password: 'password123',
        name: 'Usuario 123',
        title: 'Frontend Developer',
        description: 'Usuario específico por ID',
        town: 'Barcelona',
        can_move: false,
        roles: ['user']
      };

      service.getUserById(userId).subscribe((user: any) => {
        expect(user).toEqual(mockUser);
        expect(user.id_user).toBe(userId);
        expect(user.email).toBe('user123@test.com');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/get-user/123');
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);
    });

    it('should handle user not found error (404)', () => {
      const nonExistentUserId = 999;
      const mockError = {
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Usuario no encontrado' }
      };

      service.getUserById(nonExistentUserId).subscribe({
        next: () => {
          fail('Should have failed with 404 error');
        },
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/get-user/999');
      expect(req.request.method).toBe('GET');

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });

  describe('getUserInfo', () => {
    it('should get user info successfully', () => {
      const userId = 456;
      const mockUserInfo: UserInfoResponse = {
        code: 200,
        message: 'Usuario encontrado correctamente',
        data: {
          id: userId,
          name: 'Usuario Info Test',
          email: 'userinfo@test.com',
          title: 'Senior Developer',
          description: 'Usuario con información completa',
          town: 'Madrid',
          can_move: 1,
          photo: 'user456.jpg',
          sections: [
            {
              section_name: 'Frontend',
              section_knowledges: [
                { knowledge_name: 'Angular' },
                { knowledge_name: 'TypeScript' }
              ]
            },
            {
              section_name: 'Backend',
              section_knowledges: [
                { knowledge_name: 'Node.js' }
              ]
            }
          ]
        }
      };

      service.getUserInfo(userId).subscribe((userInfo: UserInfoResponse) => {
        expect(userInfo).toEqual(mockUserInfo);
        expect(userInfo.code).toBe(200);
        expect(userInfo.data.id).toBe(userId);
        expect(userInfo.data.sections.length).toBe(2);
        expect(userInfo.data.sections[0].section_knowledges.length).toBe(2);
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/get-user-info/456');
      expect(req.request.method).toBe('GET');

      req.flush(mockUserInfo);
    });

    it('should handle user info not found error (404)', () => {
      const nonExistentUserId = 888;
      const mockError = {
        status: 404,
        statusText: 'Not Found',
        error: { 
          code: 404,
          message: 'Usuario no encontrado',
          data: null 
        }
      };

      service.getUserInfo(nonExistentUserId).subscribe({
        next: () => {
          fail('Should have failed with 404 error');
        },
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          expect(error.error.code).toBe(404);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/get-user-info/888');
      expect(req.request.method).toBe('GET');

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', () => {
      const userToUpdate: User = {
        id_user: 789,
        email: 'updated@test.com',
        password: 'newPassword123',
        name: 'Usuario Actualizado',
        title: 'Senior Frontend Developer',
        description: 'Descripción actualizada del usuario',
        town: 'Valencia',
        can_move: true,
        roles: ['user', 'admin']
      };

      const mockResponse = {
        code: 200,
        message: 'Usuario actualizado correctamente',
        data: userToUpdate
      };

      service.updateUser(userToUpdate).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.code).toBe(200);
        expect(response.data.id_user).toBe(789);
        expect(response.data.email).toBe('updated@test.com');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(userToUpdate);

      req.flush(mockResponse);
    });

    it('should handle update user error (400)', () => {
      const invalidUser: User = {
        id_user: 999,
        email: 'invalid-email',
        password: '123',
        name: '',
        title: '',
        description: '',
        town: '',
        can_move: false,
        roles: []
      };

      const mockError = {
        status: 400,
        statusText: 'Bad Request',
        error: { 
          code: 400,
          message: 'Datos de usuario inválidos',
          errors: {
            email: 'Email no válido',
            name: 'Nombre requerido'
          }
        }
      };

      service.updateUser(invalidUser).subscribe({
        next: () => {
          fail('Should have failed with 400 error');
        },
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
          expect(error.error.code).toBe(400);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(invalidUser);

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo successfully (standard JPEG)', () => {
      // Mock File estándar
      const mockFile = new File(['fake-image-content'], 'profile.jpg', {
        type: 'image/jpeg'
      });

      const mockResponse = {
        code: 200,
        message: 'Foto subida correctamente',
        data: {
          filename: 'profile_123456.jpg',
          url: 'https://storage.tecaway.es/photos/profile_123456.jpg',
          size: 150000
        }
      };

      service.uploadPhoto(mockFile).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.code).toBe(200);
        expect(response.data.filename).toContain('profile_');
        expect(response.data.url).toContain('https://storage.tecaway.es');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/upload-photo');
      expect(req.request.method).toBe('POST');
      
      // Verificar FormData
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.body.get('file')).toBe(mockFile);
      
      // Verificar headers para iOS compatibility
      expect(req.request.headers.get('Accept')).toBe('application/json');
      
      // Verificar opciones de configuración
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.reportProgress).toBe(true);

      req.flush(mockResponse);
    });

    it('should upload iPhone HEIC photo successfully', () => {
      // Mock File de iPhone (HEIC format)
      const mockHeicFile = new File(['fake-heic-content'], 'IMG_1234.HEIC', {
        type: 'image/heic'
      });

      const mockResponse = {
        code: 200,
        message: 'Foto iPhone convertida y subida correctamente',
        data: {
          filename: 'iphone_converted_789012.jpg',
          url: 'https://storage.tecaway.es/photos/iphone_converted_789012.jpg',
          originalFormat: 'HEIC',
          convertedFormat: 'JPEG',
          size: 180000
        }
      };

      service.uploadPhoto(mockHeicFile).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.code).toBe(200);
        expect(response.data.originalFormat).toBe('HEIC');
        expect(response.data.convertedFormat).toBe('JPEG');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/upload-photo');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.get('file')).toBe(mockHeicFile);

      req.flush(mockResponse);
    });

    it('should handle upload photo error (file too large)', () => {
      const largeMockFile = new File(['very-large-content'], 'huge-photo.jpg', {
        type: 'image/jpeg'
      });

      const mockError = {
        status: 413,
        statusText: 'Payload Too Large',
        error: { 
          code: 413,
          message: 'Archivo demasiado grande',
          maxSize: '5MB',
          receivedSize: '15MB'
        }
      };

      service.uploadPhoto(largeMockFile).subscribe({
        next: () => {
          fail('Should have failed with 413 error');
        },
        error: (error) => {
          expect(error.status).toBe(413);
          expect(error.statusText).toBe('Payload Too Large');
          expect(error.error.code).toBe(413);
          expect(error.error.maxSize).toBe('5MB');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/upload-photo');
      expect(req.request.method).toBe('POST');

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', () => {
      const userIdToDelete = 555;
      const mockResponse = {
        code: 200,
        message: 'Usuario eliminado correctamente',
        data: {
          deletedUserId: userIdToDelete,
          deletedAt: '2025-08-09T10:30:00Z'
        }
      };

      service.deleteUser(userIdToDelete).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
        expect(response.code).toBe(200);
        expect(response.data.deletedUserId).toBe(userIdToDelete);
        expect(response.message).toContain('eliminado correctamente');
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/555');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockResponse);
    });

    it('should handle delete user error (403 Forbidden)', () => {
      const protectedUserId = 1; // Usuario administrador protegido
      const mockError = {
        status: 403,
        statusText: 'Forbidden',
        error: { 
          code: 403,
          message: 'No tienes permisos para eliminar este usuario',
          reason: 'Usuario administrador protegido'
        }
      };

      service.deleteUser(protectedUserId).subscribe({
        next: () => {
          fail('Should have failed with 403 error');
        },
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
          expect(error.error.code).toBe(403);
          expect(error.error.reason).toContain('protegido');
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });

    it('should handle delete user not found error (404)', () => {
      const nonExistentUserId = 99999;
      const mockError = {
        status: 404,
        statusText: 'Not Found',
        error: { 
          code: 404,
          message: 'Usuario no encontrado para eliminar',
          userId: nonExistentUserId
        }
      };

      service.deleteUser(nonExistentUserId).subscribe({
        next: () => {
          fail('Should have failed with 404 error');
        },
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          expect(error.error.code).toBe(404);
          expect(error.error.userId).toBe(nonExistentUserId);
        }
      });

      const req = httpMock.expectOne('https://api.tecaway.es/user/99999');
      expect(req.request.method).toBe('DELETE');

      req.flush(mockError.error, {
        status: mockError.status,
        statusText: mockError.statusText
      });
    });
  });
});
