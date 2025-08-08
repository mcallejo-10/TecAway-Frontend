import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddKnowledgesComponent } from './add-knowledges.component';
import { UserService } from '../../services/userService/user.service';
import { SectionService } from '../../services/sectionService/section.service';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { UserKnowledgeService } from '../../services/userKowledgeService/user-knowledge.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { fakeAsync, tick } from '@angular/core/testing';
import { configureAngularTestingModule, mockUserKnowledgeData } from '../../../testing/angular-test-helpers';

describe('AddKnowledgesComponent', () => {
  let component: AddKnowledgesComponent;
  let fixture: ComponentFixture<AddKnowledgesComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let sectionServiceMock: jasmine.SpyObj<SectionService>;
  let knowledgeServiceMock: jasmine.SpyObj<KnowledgeService>;
  let userKnowledgeServiceMock: jasmine.SpyObj<UserKnowledgeService>;

  // Mock data with proper structure
  const mockUserKnowledgeResponse = mockUserKnowledgeData;

  const mockSections: Section[] = [{
    id_section: 1,
    section: 'Test Section'
  }];

  const mockKnowledges: Knowledge[] = [{
    id_knowledge: 1,
    section_id: 1,
    knowledge: 'Test Knowledge'
  }];

  beforeEach(async () => {
    // Crear mocks de los servicios
    userServiceMock = jasmine.createSpyObj('UserService', ['getUser']);
    sectionServiceMock = jasmine.createSpyObj('SectionService', ['getSectionList', 'setSectionList', 'sectionList']);
    knowledgeServiceMock = jasmine.createSpyObj('KnowledgeService', ['getKnowledgeList', 'setKnowledgeList', 'knowledgeList']);
    userKnowledgeServiceMock = jasmine.createSpyObj('UserKnowledgeService', ['getUserKnowledgesById', 'addKnowledge', 'deleteUserKnowledge']);

    // Configurar retornos con los tipos correctos
    // Actualizado el retorno para devolver un solo objeto
    userKnowledgeServiceMock.getUserKnowledgesById.and.returnValue(of(mockUserKnowledgeResponse));

    sectionServiceMock.getSectionList.and.returnValue(of(mockSections));
    sectionServiceMock.sectionList.and.returnValue(mockSections);
    
    knowledgeServiceMock.getKnowledgeList.and.returnValue(of(mockKnowledges));
    knowledgeServiceMock.knowledgeList.and.returnValue(mockKnowledges);

    await TestBed.configureTestingModule({
      imports: [
        AddKnowledgesComponent,
        ToastrModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: SectionService, useValue: sectionServiceMock },
        { provide: KnowledgeService, useValue: knowledgeServiceMock },
        { provide: UserKnowledgeService, useValue: userKnowledgeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddKnowledgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with knowledge ID 1', () => {
    expect(component.selectedKnowledges).toContain(1);
  });

  it('should correctly check if a knowledge is selected', () => {
    component.selectedKnowledges = [1, 2, 3];
    expect(component.isSelected(2)).toBeTrue();
    expect(component.isSelected(4)).toBeFalse();
  });

  it('should not allow toggling knowledge ID 1', () => {
    component.selectedKnowledges = [1, 2];
    component.toggleKnowledge(1);
    expect(component.selectedKnowledges).toContain(1);
  });

  it('should add knowledge when toggling unselected knowledge', () => {
    component.selectedKnowledges = [1];
    component.toggleKnowledge(2);
    expect(component.selectedKnowledges).toContain(2);
  });

  it('should remove knowledge when toggling selected knowledge', () => {
    component.selectedKnowledges = [1, 2];
    component.toggleKnowledge(2);
    expect(component.selectedKnowledges).not.toContain(2);
  });

  it('should initialize lists on ngOnInit', fakeAsync(() => {
    userKnowledgeServiceMock.getUserKnowledgesById.and.returnValue(of(mockUserKnowledgeResponse));
    sectionServiceMock.getSectionList.and.returnValue(of(mockSections));
    knowledgeServiceMock.getKnowledgeList.and.returnValue(of(mockKnowledges));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.selectedKnowledges).toContain(1);
    expect(sectionServiceMock.getSectionList).toHaveBeenCalled();
    expect(knowledgeServiceMock.getKnowledgeList).toHaveBeenCalled();
  }));

  it('should save knowledges and navigate on success', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const toastrSpy = spyOn(component['toastr'], 'success');
    
    userKnowledgeServiceMock.addKnowledge.and.returnValue(of({}));
    userKnowledgeServiceMock.deleteUserKnowledge.and.returnValue(of({}));

    component.selectedKnowledges = [1, 2];
    component.userKnowledgeIds = [1, 3];
    
    component.saveKnowledges();

    expect(toastrSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/tu-cuenta']);
  });

  it('should show info message when no changes to save', () => {
    const toastrSpy = spyOn(component['toastr'], 'info');
    
    component.selectedKnowledges = [1];
    component.userKnowledgeIds = [1];
    
    component.saveKnowledges();

    expect(toastrSpy).toHaveBeenCalledWith('No hay cambios en los conocimientos');
  });
});
