import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserKnowledgeService } from './user-knowledge.service';
import { UserKnowledge } from '../../interfaces/user-knowledge';

describe('UserKnowledgeService', () => {
  let service: UserKnowledgeService;
  let httpMock: HttpTestingController;

  const mockUserKnowledges: UserKnowledge[] = [
    { user_id: 1, knowledge_id: 101 },
    { user_id: 1, knowledge_id: 102 },
    { user_id: 2, knowledge_id: 101 },
    { user_id: 2, knowledge_id: 103 }
  ];

  const mockUserSpecificKnowledges: UserKnowledge[] = [
    { user_id: 1, knowledge_id: 101 },
    { user_id: 1, knowledge_id: 102 }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserKnowledgeService
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserKnowledgeService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all user knowledge list', () => {
    service.getUserKnowledgeList().subscribe((userKnowledges: UserKnowledge[]) => {
      expect(userKnowledges).toEqual(mockUserKnowledges);
      expect(userKnowledges.length).toBe(4);
      expect(userKnowledges[0].user_id).toBe(1);
      expect(userKnowledges[0].knowledge_id).toBe(101);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/');
    expect(req.request.method).toBe('GET');

    req.flush(mockUserKnowledges);
  });

  it('should get user knowledges by user id', () => {
    service.getUserKnowledgesById().subscribe((userKnowledges: UserKnowledge[]) => {
      expect(userKnowledges).toEqual(mockUserSpecificKnowledges);
      expect(userKnowledges.length).toBe(2);
      expect(userKnowledges.every(uk => uk.user_id === 1)).toBe(true);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/user');
    expect(req.request.method).toBe('GET');

    req.flush(mockUserSpecificKnowledges);
  });

  it('should add knowledge successfully', () => {
    const knowledgeId = 105;
    const mockResponse = {
      code: 200,
      message: 'Conocimiento añadido correctamente',
      data: {
        user_id: 1,
        knowledge_id: knowledgeId,
        created_at: '2025-08-09T10:30:00Z'
      }
    };

    service.addKnowledge(knowledgeId).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.knowledge_id).toBe(knowledgeId);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(knowledgeId);

    req.flush(mockResponse);
  });

  it('should handle add knowledge error', () => {
    const knowledgeId = 999;
    const mockError = {
      status: 409,
      statusText: 'Conflict',
      error: {
        code: 409,
        message: 'El usuario ya tiene este conocimiento',
        knowledge_id: knowledgeId
      }
    };

    service.addKnowledge(knowledgeId).subscribe({
      next: () => {
        fail('Should have failed with 409 error');
      },
      error: (error) => {
        expect(error.status).toBe(409);
        expect(error.statusText).toBe('Conflict');
        expect(error.error.code).toBe(409);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/');
    expect(req.request.method).toBe('POST');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should delete user knowledge successfully', () => {
    const knowledgeId = 102;
    const mockResponse = {
      code: 200,
      message: 'Conocimiento eliminado correctamente',
      data: {
        deleted_knowledge_id: knowledgeId,
        deleted_at: '2025-08-09T10:35:00Z'
      }
    };

    service.deleteUserKnowledge(knowledgeId).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.deleted_knowledge_id).toBe(knowledgeId);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ knowledge_id: knowledgeId });

    req.flush(mockResponse);
  });

  it('should handle delete knowledge error (not found)', () => {
    const knowledgeId = 888;
    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'El usuario no tiene este conocimiento',
        knowledge_id: knowledgeId
      }
    };

    service.deleteUserKnowledge(knowledgeId).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/user-knowledge/');
    expect(req.request.method).toBe('DELETE');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });
});
