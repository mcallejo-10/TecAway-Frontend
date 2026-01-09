import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechniciansComponent } from './technicians.component';
import { FilterService } from '../../services/filterService/filter.service';
import { TechnicianStateService } from '../../services/state/technician-state.service';
import { UserService } from '../../services/userService/user.service';
import { SectionService } from '../../services/sectionService/section.service';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('TechniciansComponent', () => {
  let component: TechniciansComponent;
  let fixture: ComponentFixture<TechniciansComponent>;
  let stateService: TechnicianStateService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filterServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sectionServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let knowledgeServiceMock: any;

  // PASO 1: Mock data - Datos de prueba realistas
  const mockTechnicians = [
    {
      id_user: 1,
      email: "tech1@test.com",
      password: TEST_CREDENTIALS.HASHED_PASSWORD_1,
      name: "John Doe",
      roles: ["user"],
      title: "Frontend Developer with 5 years experience",
      description: "Experienced developer specializing in Angular and React",
      town: "Barcelona",
      can_move: true
    },
    {
      id_user: 2,
      email: "tech2@test.com",
      password: TEST_CREDENTIALS.HASHED_PASSWORD_2,
      name: "Jane Smith",
      roles: ["user"],
      title: "Backend Developer specialized in Node.js",
      description: "Expert in Node.js and database management systems",
      town: "Madrid",
      can_move: false
    }
  ];

  const mockSections = [
    { id_section: 1, section: 'Frontend' },
    { id_section: 2, section: 'Backend' },
    { id_section: 3, section: 'Conocimientos generales' }
  ];

  const mockKnowledges = [
    { id_knowledge: 1, section_id: 1, knowledge: 'Angular' },
    { id_knowledge: 2, section_id: 1, knowledge: 'React' },
    { id_knowledge: 3, section_id: 2, knowledge: 'Node.js' },
    { id_knowledge: 4, section_id: 3, knowledge: 'Conocimientos generales' }
  ];

  beforeEach(async () => {
    filterServiceMock = {
      getTechnicians: jest.fn(),
      filterTechnicians: jest.fn()
    };

    userServiceMock = {
      getUserList: jest.fn()
    };

    sectionServiceMock = {
      getSectionList: jest.fn(),
      setSectionList: jest.fn(),
      sectionList: signal(mockSections)
    };

    knowledgeServiceMock = {
      getKnowledgeList: jest.fn()
    };

    // PASO 3: Configurar retornos por defecto
    userServiceMock.getUserList.mockReturnValue(of({ data: mockTechnicians }));
    sectionServiceMock.getSectionList.mockReturnValue(of({ data: mockSections }));
    knowledgeServiceMock.getKnowledgeList.mockReturnValue(of({ data: mockKnowledges }));
    filterServiceMock.filterTechnicians.mockReturnValue([1, 2]);

    await TestBed.configureTestingModule({
      imports: [
        TechniciansComponent,
        ToastrModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        TechnicianStateService, // ✨ Proveemos el servicio real de estado
        { provide: FilterService, useValue: filterServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: SectionService, useValue: sectionServiceMock },
        { provide: KnowledgeService, useValue: knowledgeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(TechnicianStateService); // 🔄 Inyectamos el servicio
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // PASO 4: Tests de ngOnInit (sin fixture.detectChanges para evitar render completo)
  describe('ngOnInit', () => {
    it('should load sections from service', (done) => {
      component.ngOnInit();

      // Esperar a que se complete el observable
      setTimeout(() => {
        expect(sectionServiceMock.getSectionList).toHaveBeenCalled();
        expect(component.sectionList).toEqual(mockSections);
        done();
      }, 100);
    });

    it('should load knowledges from service', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        expect(knowledgeServiceMock.getKnowledgeList).toHaveBeenCalled();
        expect(component.knowledgeList).toEqual(mockKnowledges);
        done();
      }, 100);
    });

    it('should load technicians from service', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        expect(userServiceMock.getUserList).toHaveBeenCalled();
        // 🔄 Ahora verificamos el estado del servicio
        expect(stateService.allTechnicians()).toEqual(mockTechnicians);
        expect(stateService.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should add Conocimientos generales section by default', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        // 🔄 Verificamos en el estado del servicio
        const hasConocimientos = stateService.selectedSections().some(
          s => s.section === 'Conocimientos generales'
        );
        expect(hasConocimientos).toBe(true);
        done();
      }, 100);
    });
  });

  // PASO 5: Tests de selección de secciones
  describe('getSelectedSections', () => {
    beforeEach(() => {
      component.sectionList = mockSections;
      component.knowledgeList = mockKnowledges;
      // 🔄 Limpiamos el estado
      stateService.setSelectedSections([]);
      stateService.setSelectedKnowledges([]);
    });

    it('should add section when checkbox is checked', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: true } } as any;

      component.getSelectedSections(1, event);

      // 🔄 Verificamos en el estado
      expect(stateService.selectedSections()).toContainEqual(mockSections[0]);
    });

    it('should remove section when checkbox is unchecked', () => {
      // Primero añadimos una sección
      stateService.setSelectedSections([mockSections[0]]);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: false } } as any;

      component.getSelectedSections(1, event);

      // 🔄 Verificamos que se eliminó del estado
      expect(stateService.selectedSections()).not.toContainEqual(mockSections[0]);
    });

    it('should not add duplicate sections', () => {
      // Añadimos una sección
      stateService.setSelectedSections([mockSections[0]]);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: true } } as any;

      component.getSelectedSections(1, event);

      // 🔄 Verificamos que no hay duplicados en el estado
      const count = stateService.selectedSections().filter(s => s.id_section === 1).length;
      expect(count).toBe(1);
    });

    it('should call filterTechnicians after selection change', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: true } } as any;

      component.getSelectedSections(1, event);

      expect(filterServiceMock.filterTechnicians).toHaveBeenCalled();
    });
  });

  // PASO 6: Tests de selección de conocimientos
  describe('getSelectedKnowledges', () => {
    beforeEach(() => {
      component.knowledgeList = mockKnowledges;
      // 🔄 Limpiamos el estado
      stateService.setSelectedKnowledges([]);
    });

    it('should add knowledge when checkbox is checked', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: true } } as any;

      component.getSelectedKnowledges(1, event);

      // 🔄 Verificamos en el estado
      expect(stateService.selectedKnowledges()).toContainEqual(mockKnowledges[0]);
    });

    it('should remove knowledge when checkbox is unchecked', () => {
      // Primero añadimos DOS conocimientos para que al eliminar uno no quede vacía la lista
      stateService.setSelectedKnowledges([mockKnowledges[0], mockKnowledges[1]]);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: false } } as any;

      component.getSelectedKnowledges(1, event);

      // 🔄 Verificamos que se eliminó del estado
      expect(stateService.selectedKnowledges()).not.toContainEqual(mockKnowledges[0]);
      expect(stateService.selectedKnowledges()).toContainEqual(mockKnowledges[1]);
    });

    it('should call filterTechnicians after knowledge selection', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { checked: true } } as any;

      component.getSelectedKnowledges(1, event);

      expect(filterServiceMock.filterTechnicians).toHaveBeenCalled();
    });
  });

  // PASO 7: Tests de helper functions
  describe('Helper functions', () => {
    it('should check if section is selected', () => {
      // 🔄 Establecemos el estado
      stateService.setSelectedSections([mockSections[0]]);

      expect(component.isCheckedSection(1)).toBe(true);
      expect(component.isCheckedSection(2)).toBe(false);
    });

    it('should add Conocimientos generales section', () => {
      component.sectionList = mockSections;
      component.knowledgeList = mockKnowledges;
      // 🔄 Limpiamos el estado
      stateService.setSelectedSections([]);
      stateService.setSelectedKnowledges([]);

      component.addConocimientosGenerales();

      // 🔄 Verificamos en el estado
      const hasSection = stateService.selectedSections().some(
        s => s.section === 'Conocimientos generales'
      );
      expect(hasSection).toBe(true);
    });
  });

  // PASO 8: Tests de filtrado de técnicos por ID
  describe('filterTechniciansById', () => {
    beforeEach(() => {
      // 🔄 Establecemos los técnicos en el estado
      stateService.setAllTechnicians(mockTechnicians);
    });

    it('should filter technicians by IDs from filter service', () => {
      const filteredIds = [1];

      component.filterTechniciansById(filteredIds);

      // 🔄 Verificamos que se actualizó el estado
      expect(stateService.filteredTechnicians()).toContainEqual(mockTechnicians[0]);
      expect(stateService.filteredTechnicians().length).toBe(1);
    });

    it('should handle empty filter results', () => {
      const filteredIds: number[] = [];

      component.filterTechniciansById(filteredIds);

      // 🔄 Verificamos que el estado tiene un array vacío
      expect(stateService.filteredTechnicians()).toEqual([]);
    });
  });

  // PASO 9: Tests responsive getAvatarSize
  describe('getAvatarSize', () => {
    it('should return 80 for extra small screens (<= 575px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400
      });

      expect(component.getAvatarSize()).toBe(80);
    });

    it('should return 70 for small screens (576-767px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      expect(component.getAvatarSize()).toBe(70);
    });

    it('should return 45 for medium screens (768-991px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });

      expect(component.getAvatarSize()).toBe(45);
    });

    it('should return 70 for large screens (992-1199px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000
      });

      expect(component.getAvatarSize()).toBe(70);
    });

    it('should return 100 for extra large screens (>= 1200px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1400
      });

      expect(component.getAvatarSize()).toBe(100);
    });
  });
});