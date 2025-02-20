
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TechniciansComponent } from './technicians.component';
import { FilterService } from '../../services/filterService/filter.service';
import { UserService } from '../../services/userService/user.service';
import { SectionService } from '../../services/sectionService/section.service';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('TechniciansComponent', () => {
  let component: TechniciansComponent;
  let fixture: ComponentFixture<TechniciansComponent>;
  let filterService: jasmine.SpyObj<FilterService>;
  let userService: jasmine.SpyObj<UserService>;
  let sectionService: jasmine.SpyObj<SectionService>;
  let knowledgeService: jasmine.SpyObj<KnowledgeService>;

  beforeEach(async () => {
    // Create spies for all services with all required methods
    filterService = jasmine.createSpyObj('FilterService', 
      ['getTechnicians', 'filterTechnicians', 'setTechnicianList', 'setSelectedSections', 'setSelectedKnowledges'], {
      techniciansFiltred: signal([])
    });
    userService = jasmine.createSpyObj('UserService', ['getUserList']);
    sectionService = jasmine.createSpyObj('SectionService', ['getSectionList', 'setSectionList', 'sectionList']);
    knowledgeService = jasmine.createSpyObj('KnowledgeService', ['getKnowledgeList']);

    // Mock implementations
filterService.setTechnicianList.and.returnValue(undefined);
    filterService.setSelectedSections.and.returnValue(undefined);
    filterService.setSelectedKnowledges.and.returnValue(undefined);
    filterService.filterTechnicians.and.returnValue([1, 2]);

    userService.getUserList.and.returnValue(of([
      {
        id_user: 1,
        email: "tech1@test.com",
        password: "hashedPassword123",
        name: "Tech 1",
        roles: ["user"],
        title: "Technical Expert in Testing",
        description: "This is a valid description that meets the minimum length requirement of 30 characters",
        town: "Barcelona",
        can_move: true
      }
    ]));

    sectionService.getSectionList.and.returnValue(of([
      { id_section: 1, section: 'Frontend' },
      { id_section: 2, section: 'Backend' },
      { id_section: 3, section: 'Conocimientos generales' }
    ]));
    sectionService.sectionList.and.returnValue([
      { id_section: 1, section: 'Frontend' },
      { id_section: 2, section: 'Backend' },
      { id_section: 3, section: 'Conocimientos generales' }
    ]);
    sectionService.setSectionList.and.returnValue(undefined);

    knowledgeService.getKnowledgeList.and.returnValue(of([
      { id_knowledge: 1, section_id: 1, knowledge: 'Angular' },
      { id_knowledge: 2, section_id: 1, knowledge: 'React' },
      { id_knowledge: 3, section_id: 2, knowledge: 'Node.js' }
    ]));

    filterService.filterTechnicians.and.returnValue([1, 2, 3]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        TechniciansComponent
      ],
      providers: [
        { provide: FilterService, useValue: filterService },
        { provide: UserService, useValue: userService },
        { provide: SectionService, useValue: sectionService },
        { provide: KnowledgeService, useValue: knowledgeService },
        { provide: HttpClient, useValue: jasmine.createSpyObj('HttpClient', ['get', 'post']) },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});