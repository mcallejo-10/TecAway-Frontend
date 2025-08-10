import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SectionService } from './section.service';
import { Section } from '../../interfaces/section';

describe('SectionService', () => {
  let service: SectionService;
  let httpMock: HttpTestingController;

  const mockSections: Section[] = [
    { id_section: 1, section: 'Frontend Development' },
    { id_section: 2, section: 'Backend Development' },
    { id_section: 3, section: 'DevOps & Cloud' },
    { id_section: 4, section: 'Mobile Development' }
  ];

  const mockSection: Section = {
    id_section: 5,
    section: 'Data Science'
  };

  const mockNewSection: Section = {
    section: 'Machine Learning'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SectionService
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SectionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all section list', () => {
    service.getSectionList().subscribe((sections: Section[]) => {
      expect(sections).toEqual(mockSections);
      expect(sections.length).toBe(4);
      expect(sections[0].section).toBe('Frontend Development');
      expect(sections[0].id_section).toBe(1);
    });

    const req = httpMock.expectOne('https://api.tecaway.es/section');
    expect(req.request.method).toBe('GET');

    req.flush(mockSections);
  });

  it('should get section by id', () => {
    const sectionId = 5;

    service.getSectionById(sectionId).subscribe((section: Section) => {
      expect(section).toEqual(mockSection);
      expect(section.id_section).toBe(sectionId);
      expect(section.section).toBe('Data Science');
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${sectionId}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockSection);
  });

  it('should handle get section by id error (not found)', () => {
    const sectionId = 999;
    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Sección no encontrada',
        section_id: sectionId
      }
    };

    service.getSectionById(sectionId).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${sectionId}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should save new section successfully', () => {
    const mockResponse = {
      code: 201,
      message: 'Sección creada correctamente',
      data: {
        id_section: 6,
        section: 'Machine Learning',
        created_at: '2025-08-10T10:30:00Z'
      }
    };

    service.saveSection(mockNewSection).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(201);
      expect(response.data.section).toBe('Machine Learning');
    });

    const req = httpMock.expectOne('https://api.tecaway.es/section');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockNewSection);

    req.flush(mockResponse);
  });

  it('should handle save section error (validation)', () => {
    const invalidSection: Section = {
      section: '' // Invalid empty name
    };

    const mockError = {
      status: 400,
      statusText: 'Bad Request',
      error: {
        code: 400,
        message: 'El nombre de la sección es requerido',
        validation_errors: ['section field is required']
      }
    };

    service.saveSection(invalidSection).subscribe({
      next: () => {
        fail('Should have failed with 400 error');
      },
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error.code).toBe(400);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/section');
    expect(req.request.method).toBe('POST');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should handle save section error (duplicate)', () => {
    const duplicateSection: Section = {
      section: 'Frontend Development' // Ya existe
    };

    const mockError = {
      status: 409,
      statusText: 'Conflict',
      error: {
        code: 409,
        message: 'La sección ya existe',
        section_name: 'Frontend Development'
      }
    };

    service.saveSection(duplicateSection).subscribe({
      next: () => {
        fail('Should have failed with 409 error');
      },
      error: (error) => {
        expect(error.status).toBe(409);
        expect(error.statusText).toBe('Conflict');
        expect(error.error.code).toBe(409);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/section');
    expect(req.request.method).toBe('POST');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should update section successfully', () => {
    const updatedSection: Section = {
      id_section: 5,
      section: 'Advanced Data Science'
    };

    const mockResponse = {
      code: 200,
      message: 'Sección actualizada correctamente',
      data: {
        id_section: 5,
        section: 'Advanced Data Science',
        updated_at: '2025-08-10T10:35:00Z'
      }
    };

    service.updateSection(updatedSection).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.section).toBe('Advanced Data Science');
      expect(response.data.id_section).toBe(5);
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${updatedSection.id_section}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSection);

    req.flush(mockResponse);
  });

  it('should handle update section error (not found)', () => {
    const nonExistentSection: Section = {
      id_section: 999,
      section: 'Non-existent Section'
    };

    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Sección no encontrada para actualizar',
        section_id: 999
      }
    };

    service.updateSection(nonExistentSection).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${nonExistentSection.id_section}`);
    expect(req.request.method).toBe('PUT');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should delete section successfully', () => {
    const sectionId = 4;
    const mockResponse = {
      code: 200,
      message: 'Sección eliminada correctamente',
      data: {
        deleted_section_id: sectionId,
        deleted_at: '2025-08-10T10:40:00Z'
      }
    };

    service.deleteSection(sectionId).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.data.deleted_section_id).toBe(sectionId);
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${sectionId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });

  it('should handle delete section error (not found)', () => {
    const sectionId = 777;
    const mockError = {
      status: 404,
      statusText: 'Not Found',
      error: {
        code: 404,
        message: 'Sección no encontrada para eliminar',
        section_id: sectionId
      }
    };

    service.deleteSection(sectionId).subscribe({
      next: () => {
        fail('Should have failed with 404 error');
      },
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.code).toBe(404);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${sectionId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  it('should handle delete section error (conflict - has knowledges)', () => {
    const sectionId = 1;
    const mockError = {
      status: 409,
      statusText: 'Conflict',
      error: {
        code: 409,
        message: 'No se puede eliminar: Sección tiene conocimientos asociados',
        section_id: sectionId,
        knowledges_count: 8
      }
    };

    service.deleteSection(sectionId).subscribe({
      next: () => {
        fail('Should have failed with 409 error');
      },
      error: (error) => {
        expect(error.status).toBe(409);
        expect(error.statusText).toBe('Conflict');
        expect(error.error.code).toBe(409);
        expect(error.error.knowledges_count).toBe(8);
      }
    });

    const req = httpMock.expectOne(`https://api.tecaway.es/section${sectionId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });

  describe('Angular Signals Integration', () => {
    it('should set section list using signal', () => {
      // Verificar estado inicial
      expect(service.sectionList()).toEqual([]);

      // Establecer lista
      service.setSectionList(mockSections);

      // Verificar que el signal se actualizó
      expect(service.sectionList()).toEqual(mockSections);
      expect(service.sectionList().length).toBe(4);
      expect(service.sectionList()[0].section).toBe('Frontend Development');
    });

    it('should update section list signal with new data', () => {
      // Establecer lista inicial
      service.setSectionList(mockSections);
      expect(service.sectionList().length).toBe(4);

      // Nueva lista con secciones adicionales
      const updatedSections: Section[] = [
        ...mockSections,
        { id_section: 7, section: 'Blockchain Development' },
        { id_section: 8, section: 'Game Development' }
      ];

      // Actualizar lista
      service.setSectionList(updatedSections);

      // Verificar actualización
      expect(service.sectionList().length).toBe(6);
      expect(service.sectionList().some(s => s.section === 'Blockchain Development')).toBe(true);
      expect(service.sectionList().some(s => s.section === 'Game Development')).toBe(true);
    });

    it('should handle empty section list signal', () => {
      // Establecer lista inicial
      service.setSectionList(mockSections);
      expect(service.sectionList().length).toBe(4);

      // Limpiar lista
      service.setSectionList([]);

      // Verificar que está vacía
      expect(service.sectionList()).toEqual([]);
      expect(service.sectionList().length).toBe(0);
    });

    it('should maintain section list signal reactivity', () => {
      // Verificar estado inicial
      expect(service.sectionList()).toEqual([]);

      // Establecer nueva lista
      const newSections = [mockSections[0], mockSections[1]];
      service.setSectionList(newSections);

      // Verificar que el signal se actualizó correctamente
      expect(service.sectionList()).toEqual(newSections);
      expect(service.sectionList().length).toBe(2);
      expect(service.sectionList()[0].section).toBe('Frontend Development');
      expect(service.sectionList()[1].section).toBe('Backend Development');
    });
  });
});
