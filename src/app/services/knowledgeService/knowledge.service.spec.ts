/* eslint-disable */ 

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { KnowledgeService } from './knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let httpMock: HttpTestingController;

  const mockKnowledges: Knowledge[] = [
    { id_knowledge: 1, knowledge: 'Angular', section_id: 1 },
    { id_knowledge: 2, knowledge: 'TypeScript', section_id: 1 },
    { id_knowledge: 3, knowledge: 'Node.js', section_id: 2 },
    { id_knowledge: 4, knowledge: 'Express', section_id: 2 }
  ];

  const mockKnowledge: Knowledge = {
    id_knowledge: 5,
    knowledge: 'React',
    section_id: 1
  };

  const mockNewKnowledge: Knowledge = {
    knowledge: 'Vue.js',
    section_id: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        KnowledgeService
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(KnowledgeService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all knowledge list', () => {
    service.getKnowledgeList().subscribe((knowledges: Knowledge[]) => {
      expect(knowledges).toEqual(mockKnowledges);
      expect(knowledges.length).toBe(4);
      expect(knowledges[0].knowledge).toBe('Angular');
      expect(knowledges[0].section_id).toBe(1);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/knowledge/');
    expect(req.request.method).toBe('GET');

    req.flush(mockKnowledges);
  });

  it('should get knowledge by id', () => {
    const knowledgeId = 5;

    service.getKnowledgeById(knowledgeId).subscribe((knowledge: Knowledge) => {
      expect(knowledge).toEqual(mockKnowledge);
      expect(knowledge.id_knowledge).toBe(knowledgeId);
      expect(knowledge.knowledge).toBe('React');
      expect(knowledge.section_id).toBe(1);
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${knowledgeId}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockKnowledge);
  });

  it('should handle get knowledge by id error (not found)', () => {
    const knowledgeId = 999;
    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Conocimiento no encontrado',
        knowledge_id: knowledgeId
      }
    };

    service.getKnowledgeById(knowledgeId).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${knowledgeId}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should save new knowledge successfully', () => {
    const mockResponse = {
      code: 201,
      message: 'Conocimiento creado correctamente',
      data: {
        id_knowledge: 6,
        knowledge: 'Vue.js',
        section_id: 1,
        created_at: '2025-08-10T09:15:00Z'
      }
    };

    service.saveKnowledge(mockNewKnowledge).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(201);
      expect(response.data.knowledge).toBe('Vue.js');
      expect(response.data.section_id).toBe(1);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/knowledge/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockNewKnowledge);

    req.flush(mockResponse);
  });

  it('should handle save knowledge error (validation)', () => {
    const invalidKnowledge: Knowledge = {
      knowledge: '', // Invalid empty name
      section_id: 1
    };

    const mockError = {
      status: 400,
      statusText: 'Bad Request',
      error: {
        code: 400,
        message: 'El nombre del conocimiento es requerido',
        validation_errors: ['knowledge field is required']
      }
    };

    service.saveKnowledge(invalidKnowledge).subscribe({
      next: () => {
        fail('Should have failed with 400 error');
      },
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error.code).toBe(400);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/knowledge/');
    expect(req.request.method).toBe('POST');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should update knowledge successfully', () => {
    const updatedKnowledge: Knowledge = {
      id_knowledge: 5,
      knowledge: 'React 18',
      section_id: 1
    };

    const mockResponse = {
      code: 200,
      message: 'Conocimiento actualizado correctamente',
      data: {
        id_knowledge: 5,
        knowledge: 'React 18',
        section_id: 1,
        updated_at: '2025-08-10T09:20:00Z'
      }
    };

    service.updateKnowledge(updatedKnowledge).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.knowledge).toBe('React 18');
      expect(response.data.id_knowledge).toBe(5);
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${updatedKnowledge.id_knowledge}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedKnowledge);

    req.flush(mockResponse);
  });

  it('should handle update knowledge error (not found)', () => {
    const nonExistentKnowledge: Knowledge = {
      id_knowledge: 999,
      knowledge: 'Non-existent',
      section_id: 1
    };

    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Conocimiento no encontrado para actualizar',
        knowledge_id: 999
      }
    };

    service.updateKnowledge(nonExistentKnowledge).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${nonExistentKnowledge.id_knowledge}`);
    expect(req.request.method).toBe('PUT');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should delete knowledge successfully', () => {
    const knowledgeId = 3;
    const mockResponse = {
      code: 200,
      message: 'Conocimiento eliminado correctamente',
      data: {
        deleted_knowledge_id: knowledgeId,
        deleted_at: '2025-08-10T09:25:00Z'
      }
    };

    service.deleteKnowledge(knowledgeId).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.deleted_knowledge_id).toBe(knowledgeId);
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${knowledgeId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });

  it('should handle delete knowledge error (not found)', () => {
    const knowledgeId = 777;
    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Conocimiento no encontrado para eliminar',
        knowledge_id: knowledgeId
      }
    };

    service.deleteKnowledge(knowledgeId).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${knowledgeId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should handle delete knowledge error (conflict - in use)', () => {
    const knowledgeId = 1;
    const mockError = {
      status: 409,
      statusText: 'Conflict',
      error: {
        code: 409,
        message: 'No se puede eliminar: Conocimiento en uso por usuarios',
        knowledge_id: knowledgeId,
        users_count: 5
      }
    };

    service.deleteKnowledge(knowledgeId).subscribe({
      next: () => {
        fail('Should have failed with 409 error');
      },
      error: (error) => {
        expect(error.status).toBe(409);
        expect(error.statusText).toBe('Conflict');
        expect(error.error.code).toBe(409);
        expect(error.error.users_count).toBe(5);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/knowledge/${knowledgeId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  describe('Angular Signals Integration', () => {
    it('should set knowledge list using signal', () => {
      // Verificar estado inicial
      expect(service.knowledgeList()).toEqual([]);

      // Establecer lista
      service.setKnowledgeList(mockKnowledges);

      // Verificar que el signal se actualizó
      expect(service.knowledgeList()).toEqual(mockKnowledges);
      expect(service.knowledgeList().length).toBe(4);
      expect(service.knowledgeList()[0].knowledge).toBe('Angular');
    });

    it('should update knowledge list signal with new data', () => {
      // Establecer lista inicial
      service.setKnowledgeList(mockKnowledges);
      expect(service.knowledgeList().length).toBe(4);

      // Nueva lista con conocimientos adicionales
      const updatedKnowledges: Knowledge[] = [
        ...mockKnowledges,
        { id_knowledge: 7, knowledge: 'Svelte', section_id: 1 },
        { id_knowledge: 8, knowledge: 'Nuxt.js', section_id: 1 }
      ];

      // Actualizar lista
      service.setKnowledgeList(updatedKnowledges);

      // Verificar actualización
      expect(service.knowledgeList().length).toBe(6);
      expect(service.knowledgeList().some(k => k.knowledge === 'Svelte')).toBe(true);
      expect(service.knowledgeList().some(k => k.knowledge === 'Nuxt.js')).toBe(true);
    });

    it('should handle empty knowledge list signal', () => {
      // Establecer lista inicial
      service.setKnowledgeList(mockKnowledges);
      expect(service.knowledgeList().length).toBe(4);

      // Limpiar lista
      service.setKnowledgeList([]);

      // Verificar que está vacía
      expect(service.knowledgeList()).toEqual([]);
      expect(service.knowledgeList().length).toBe(0);
    });
  });
});
