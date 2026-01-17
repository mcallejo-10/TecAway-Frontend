import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FilterService } from './filter.service';
import { UserKnowledgeService } from '../userKowledgeService/user-knowledge.service';
import { KnowledgeService } from '../knowledgeService/knowledge.service';
import { TechnicianStateService } from '../state/technician-state.service';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { of } from 'rxjs';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('FilterService', () => {
  let service: FilterService;
  let stateService: TechnicianStateService;
  let httpMock: HttpTestingController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userKnowledgeServiceSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const userKnowledgeSpy = {
      getUserKnowledgeList: jest.fn()
    };
    const knowledgeSpy = {
      knowledgeList: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FilterService,
        TechnicianStateService, // 🆕 Añadido el servicio de estado real
        { provide: UserKnowledgeService, useValue: userKnowledgeSpy },
        { provide: KnowledgeService, useValue: knowledgeSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    userKnowledgeServiceSpy = TestBed.inject(UserKnowledgeService);
    knowledgeServiceSpy = TestBed.inject(KnowledgeService);
    stateService = TestBed.inject(TechnicianStateService); // 🆕 Inyectamos el servicio de estado

    // Setup mocks
    (userKnowledgeServiceSpy.getUserKnowledgeList as jest.Mock).mockReturnValue(
      of({ data: mockUserKnowledges })
    );
    (knowledgeServiceSpy.knowledgeList as jest.Mock).mockReturnValue(mockKnowledges);

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

  describe('Filtering Methods', () => {
    beforeEach(() => {
      // Setup data para filtrado
      stateService.setSelectedSections(mockSections); // Frontend y Backend
      stateService.setSelectedKnowledges(mockKnowledges); // Todos los conocimientos
    });

    it('should filter users by sections correctly', () => {
      // Solo sección Frontend (id: 1)
      stateService.setSelectedSections([mockSections[0]]);
      stateService.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filteredBySections();
      
      // Usuario 1 tiene Angular (section_id: 1), Usuario 2 también
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should filter users by multiple sections', () => {
      // Frontend y Backend
      stateService.setSelectedSections(mockSections);
      stateService.setSelectedKnowledges([
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
      stateService.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filterByKnowledges(userIds);
      
      // Ambos usuarios tienen Angular
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should filter users by multiple knowledges (AND logic)', () => {
      const userIds = [1, 2];
      
      // Filtrar usuarios que tengan Angular Y TypeScript
      stateService.setSelectedKnowledges([
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
      stateService.setSelectedSections([mockSections[0]]); // Frontend
      stateService.setSelectedKnowledges([]); // Sin conocimientos específicos
      
      const filteredIds = service.filterByKnowledges(userIds);
      
      // Ambos usuarios tienen conocimientos de Frontend
      expect(filteredIds).toContain(1); // Tiene Angular (Frontend)
      expect(filteredIds).toContain(2); // Tiene Angular (Frontend)
    });

    it('should combine section and knowledge filtering in main filter', () => {
      // Setup: Frontend + Angular específicamente
      stateService.setSelectedSections([mockSections[0]]); // Frontend
      stateService.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const filteredIds = service.filterTechnicians();
      
      // Ambos usuarios tienen Angular en Frontend
      expect(filteredIds).toContain(1);
      expect(filteredIds).toContain(2);
    });

    it('should return empty array when no matches in main filter', () => {
      // Setup imposible: Backend + Angular (Angular está en Frontend)
      stateService.setSelectedSections([mockSections[1]]); // Backend
      stateService.setSelectedKnowledges([mockKnowledges[0]]); // Angular (Frontend)
      
      const filteredIds = service.filterTechnicians();
      
      // No debería encontrar usuarios
      expect(filteredIds).toEqual([]);
    });

    it('should filter by town correctly', () => {
      // Setup datos de técnicos en el stateService
      stateService.setAllTechnicians(mockUsers);
      stateService.setFilteredTechnicians(mockUsers);
      
      // Mock manualmente el resultado esperado de filteredBySections
      stateService.setSelectedSections([mockSections[0]]); // Frontend
      stateService.setSelectedKnowledges([mockKnowledges[0]]); // Angular
      
      const madridUsers = service.filterByTown('Madrid');
      const barcelonaUsers = service.filterByTown('Barcelona');
      
      expect(madridUsers).toContain(1); // Usuario 1 está en Madrid
      expect(barcelonaUsers).toContain(2); // Usuario 2 está en Barcelona
    });

    it('should return empty array when town not found', () => {
      stateService.setAllTechnicians(mockUsers);
      stateService.setSelectedSections([mockSections[0]]);
      stateService.setSelectedKnowledges([mockKnowledges[0]]);
      
      const sevillaUsers = service.filterByTown('Sevilla');
      
      expect(sevillaUsers).toEqual([]);
    });

    it('should handle empty sections and knowledges', () => {
      stateService.setSelectedSections([]);
      stateService.setSelectedKnowledges([]);
      
      const filteredIds = service.filteredBySections();
      
      // Con arrays vacíos, la lógica debería manejar correctamente
      expect(Array.isArray(filteredIds)).toBe(true);
    });

    it('should handle empty userIds in filterByKnowledges', () => {
      const emptyUserIds: number[] = [];
      stateService.setSelectedKnowledges([mockKnowledges[0]]);
      
      const filteredIds = service.filterByKnowledges(emptyUserIds);
      
      expect(filteredIds).toEqual([]);
    });
  });
});
