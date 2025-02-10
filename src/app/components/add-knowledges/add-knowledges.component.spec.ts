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

describe('AddKnowledgesComponent', () => {
  let component: AddKnowledgesComponent;
  let fixture: ComponentFixture<AddKnowledgesComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let sectionServiceMock: jasmine.SpyObj<SectionService>;
  let knowledgeServiceMock: jasmine.SpyObj<KnowledgeService>;
  let userKnowledgeServiceMock: jasmine.SpyObj<UserKnowledgeService>;

  const mockUserKnowledge: UserKnowledge = {  // Cambiado de UserKnowledge[] a UserKnowledge
    user_id: 1,
    knowledge_id: 1
  };

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
    userKnowledgeServiceMock = jasmine.createSpyObj('UserKnowledgeService', ['getUserKnowledgesById']);

    // Configurar retornos con los tipos correctos
    // Actualizado el retorno para devolver un solo objeto
    userKnowledgeServiceMock.getUserKnowledgesById.and.returnValue(of(mockUserKnowledge));

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
});
