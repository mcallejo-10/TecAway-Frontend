/* eslint-disable */ 

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FilterService } from './filter.service';
import { UserKnowledgeService } from '../userKowledgeService/user-knowledge.service';
import { KnowledgeService } from '../knowledgeService/knowledge.service';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { of } from 'rxjs';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('FilterService', () => {
  let service: FilterService;
  let httpMock: HttpTestingController;
  let userKnowledgeServiceSpy: any;
  let knowledgeServiceSpy: any;

  // Mock data
  const mockUserKnowledges: UserKnowledge[] = [
    { user_id: 1, knowledge_id: 101 },
    { user_id: 1, knowledge_id: 102 },
    { user_id: 2, knowledge_id: 101 },
    { user_id: 2, knowledge_id: 103 }
  ];

  const mockKnowledges: Knowledge[] = [
    { id_knowledge: 101, knowledge: 'Angular', section_id: 1 },
    { id_knowledge: 102, knowledge: 'TypeScript', section_id: 1 },
    { id_knowledge: 103, knowledge: 'Node.js', section_id: 2 }
  ];

  const mockSections: Section[] = [
    { id_section: 1, section: 'Frontend' },
    { id_section: 2, section: 'Backend' }
  ];

  const mockUsers: User[] = [
    {
      id_user: 1,
      email: 'user1@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Usuario 1',
      title: 'Frontend Developer',
      description: 'Especialista en Angular',
      town: 'Madrid',
      can_move: true,
      roles: ['user'],
      created_at: new Date('2025-01-01T10:00:00Z')
    },
    {
      id_user: 2,
      email: 'user2@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Usuario 2',
      title: 'Fullstack Developer',
      description: 'Angular y Node.js',
      town: 'Barcelona',
      can_move: false,
      roles: ['user'],
      created_at: new Date('2025-01-02T10:00:00Z')
    }
  ];

  beforeEach(() => {
    const userKnowledgeSpy = jasmine.createSpyObj('UserKnowledgeService', ['getUserKnowledgeList']);
    const knowledgeSpy = jasmine.createSpyObj('KnowledgeService', ['knowledgeList']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FilterService,
        { provide: UserKnowledgeService, useValue: userKnowledgeSpy },
        { provide: KnowledgeService, useValue: knowledgeSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    userKnowledgeServiceSpy = TestBed.inject(UserKnowledgeService);
    knowledgeServiceSpy = TestBed.inject(KnowledgeService);

    // Setup mocks
    userKnowledgeServiceSpy.getUserKnowledgeList.and.returnValue(
      of({ data: mockUserKnowledges })
    );
    knowledgeServiceSpy.knowledgeList.and.returnValue(mockKnowledges);

    service = TestBed.inject(FilterService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user knowledge list on initialization', () => {
    expect(userKnowledgeServiceSpy.getUserKnowledgeList).toHaveBeenCalled();
    expect(service.userKnowledgeList()).toEqual(mockUserKnowledges);
  });

  describe('Setters', () => {
    it('should set selected sections', () => {
      const sections = [mockSections[0]]; // Solo Frontend
      
      service.setSelectedSections(sections);
      
      expect(service.selectedSections()).toEqual(sections);
    });

    it('should set selected knowledges', () => {
      const knowledges = [mockKnowledges[0], mockKnowledges[1]]; // Angular y TypeScript
      
      service.setSelectedKnowledges(knowledges);
      
      expect(service.selectedKnowledges()).toEqual(knowledges);
    });

    it('should set technician list and sort by date', () => {
      service.setTechnicianList(mockUsers);
      
      const sortedUsers = service.techniciansFiltred();
      expect(sortedUsers.length).toBe(2);
      // Usuario 2 debe estar primero (fecha más reciente)
      expect(sortedUsers[0].id_user).toBe(2);
      expect(sortedUsers[1].id_user).toBe(1);
    });
  });

  describe('Filtering Methods', () => {
    beforeEach(() => {
      // Setup data para filtrado
      service.setSelectedSections(mockSections); // Frontend y Backend
      service.setSelectedKnowledges(mockKnowledges); // Todos los conocimientos
    });

    it('should filter users by sections correctly', () => {
      // Solo sección Frontend (id: 1)
      service.setSelectedSections([mockSections[0]]);
      service.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filteredBySections();
      
      // Usuario 1 tiene Angular (section_id: 1), Usuario 2 también
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should filter users by multiple sections', () => {
      // Frontend y Backend
      service.setSelectedSections(mockSections);
      service.setSelectedKnowledges([
        mockKnowledges[0], // Angular (Frontend)
        mockKnowledges[2]  // Node.js (Backend)
      ]);
      
      const filteredIds = service.filteredBySections();
      
      // Solo Usuario 2 tiene ambos: Angular Y Node.js
      expect(filteredIds).toContain(2);
      expect(filteredIds).not.toContain(1); // Usuario 1 no tiene Node.js
    });

    it('should filter users by specific knowledges', () => {
      const userIds = [1, 2]; // Ambos usuarios
      
      // Filtrar solo usuarios con Angular
      service.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filterByKnowledges(userIds);
      
      // Ambos usuarios tienen Angular
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should filter users by multiple knowledges (AND logic)', () => {
      const userIds = [1, 2];
      
      // Filtrar usuarios que tengan Angular Y TypeScript
      service.setSelectedKnowledges([
        mockKnowledges[0], // Angular
        mockKnowledges[1]  // TypeScript
      ]);
      
      const filteredIds = service.filterByKnowledges(userIds);
      
      // Solo Usuario 1 tiene ambos: Angular Y TypeScript
      expect(filteredIds).toContain(1);
      expect(filteredIds).not.toContain(2); // Usuario 2 no tiene TypeScript
    });

    it('should return users by section when no specific knowledges selected', () => {
      const userIds = [1, 2];
      
      // Solo secciones seleccionadas, sin conocimientos específicos
      service.setSelectedSections([mockSections[0]]); // Frontend
      service.setSelectedKnowledges([]); // Sin conocimientos específicos
      
      const filteredIds = service.filterByKnowledges(userIds);
      
      // Ambos usuarios tienen conocimientos de Frontend
      expect(filteredIds).toContain(1); // Tiene Angular (Frontend)
      expect(filteredIds).toContain(2); // Tiene Angular (Frontend)
    });

    it('should combine section and knowledge filtering in main filter', () => {
      // Setup: Frontend + Angular específicamente
      service.setSelectedSections([mockSections[0]]); // Frontend
      service.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filterTechnicians();
      
      // Ambos usuarios tienen Angular en Frontend
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should return empty array when no matches in main filter', () => {
      // Setup imposible: Backend + Angular (Angular está en Frontend)
      service.setSelectedSections([mockSections[1]]); // Backend
      service.setSelectedKnowledges([mockKnowledges[0]]); // Angular (Frontend)
      
      const filteredIds = service.filterTechnicians();
      
      // No debería encontrar usuarios
      expect(filteredIds).toEqual([]);
    });

    it('should filter by town correctly', () => {
      // Setup datos de técnicos primero
      service.setTechnicianList(mockUsers);
      
      // Mock manualmente el resultado esperado de filteredBySections
      service.setSelectedSections([mockSections[0]]); // Frontend
      service.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const madridUsers = service.filterByTown('Madrid');
      const barcelonaUsers = service.filterByTown('Barcelona');
      
      expect(madridUsers).toContain(1); // Usuario 1 está en Madrid
      expect(barcelonaUsers).toContain(2); // Usuario 2 está en Barcelona
    });

    it('should return empty array when town not found', () => {
      service.setTechnicianList(mockUsers);
      service.setSelectedSections([mockSections[0]]);
      service.setSelectedKnowledges([mockKnowledges[0]]);
      
      const sevillaUsers = service.filterByTown('Sevilla');
      
      expect(sevillaUsers).toEqual([]);
    });

    it('should handle empty sections and knowledges', () => {
      service.setSelectedSections([]);
      service.setSelectedKnowledges([]);
      
      const filteredIds = service.filteredBySections();
      
      // Con arrays vacíos, la lógica debería manejar correctamente
      expect(Array.isArray(filteredIds)).toBe(true);
    });

    it('should handle empty userIds in filterByKnowledges', () => {
      const emptyUserIds: number[] = [];
      service.setSelectedKnowledges([mockKnowledges[0]]);
      
      const filteredIds = service.filterByKnowledges(emptyUserIds);
      
      expect(filteredIds).toEqual([]);
    });
  });
});
