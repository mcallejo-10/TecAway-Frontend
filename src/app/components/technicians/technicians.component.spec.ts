
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TechniciansComponent } from './technicians.component';
import { FilterService } from '../../services/filterService/filter.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { signal } from '@angular/core';


describe('TechniciansComponent', () => {
  let component: TechniciansComponent;
  let fixture: ComponentFixture<TechniciansComponent>;
  let filterService: jasmine.SpyObj<FilterService>;

  const mockTechnicians = [
    {
      email: "ismael.academy@gmail.com",
      password: "$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q", //pass: ismael123
      name: "Ismael",
      title: "Ha de ser un titulo entre 30 y 130 caracteresm",
      description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc  lorem i skjd",
      town: "Barcelona",
      can_move: true,
      roles: ["user"],
    },
    {
      email: "laura@hotmail.com",
      password: "$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q", //pass: ismael123
      name: "Laura",
      title: "Ha de ser un titulo entre 30 y 130 caracteresm",
      description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc  lorem i skjd Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc  lorem i skjd",
      town: "Barcelona",
      can_move: false,
      roles: ["user"],
    },
    {
      email: "maria@hotmail.com",
      password: "$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q", //pass: ismael123
      name: "Maria",
      title: "Ha de ser un titulo entre 30 y 130 caracteresm",
      description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc  lorem i skjd",
      town: "Barcelona",
      can_move: true,
      roles: ["mod", "admin"],
    },
    {
      email: "mod@hotmail.com",
      password: "$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q", //pass: ismael123
      name: "Moderador",
      title: "Ha de ser un titulo entre 30 y 130 caracteresm",
      description: "Aquí un texto de ejemplo: lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc  lorem i skjd",
      town: "Madrid",
      can_move: true,
      roles: ["admin"],
    },
  ];

  const mockSections = [
    { id_section: 1, section: 'Frontend' },
    { id_section: 2, section: 'Backend' },
    { id_section: 3, section: 'Conocimientos generales' }
  ];

  const mockKnowledges = [
    { id_knowledge: 1, section_id: 1, knowledge: 'Angular' },
    { id_knowledge: 2, section_id: 1, knowledge: 'React' },
    { id_knowledge: 3, section_id: 2, knowledge: 'Node.js' }
  ];

  beforeEach(async () => {
    filterService = jasmine.createSpyObj('FilterService', ['getTechnicians'], {
      techniciansFiltred: signal(mockTechnicians)
    });

    await TestBed.configureTestingModule({
      declarations: [], 
      imports: [
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        TechniciansComponent
      ],
      providers: [
        { provide: FilterService, useValue: filterService },
        { provide: HttpClient, useValue: jasmine.createSpyObj('HttpClient', ['get', 'post']) },
        { provide: ActivatedRoute, useValue: { /* mock route data if needed */ } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansComponent);
    component = fixture.componentInstance;
    
    // Mover estas líneas dentro del beforeEach
    component.sectionList = mockSections;
    component.knowledgeList = mockKnowledges;
    fixture.detectChanges();
  }); // Solo un cierre de llave aquí

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display technicians list', () => {
    const techniciansElements = fixture.nativeElement.querySelectorAll('.card-technician');
    expect(techniciansElements.length).toBe(mockTechnicians.length);
  });

  it('should display "No hay técnicos disponibles" when list is empty', () => {
    filterService.techniciansFiltred.set([]); // Cambiado next() por set()
    fixture.detectChanges();
    
    const emptyMessage = fixture.nativeElement.querySelector('.card-title');
    expect(emptyMessage.textContent).toContain('No hay técnicos disponibles');
  });

  it('should toggle filter visibility on mobile', () => {
    component.toggleFilter();
    expect(document.querySelector('.filter-card')?.classList.contains('show')).toBeTrue();
    
    component.closeFilter();
    expect(document.querySelector('.filter-card')?.classList.contains('show')).toBeFalse();
  });

  it('should handle section selection', () => {
    const event = { target: { checked: true } } as any;
    component.getSelectedSections(1, event);
    expect(component.isCheckedSection(1)).toBeTrue();

    event.target.checked = false;
    component.getSelectedSections(1, event);
    expect(component.isCheckedSection(1)).toBeFalse();
  });

  it('should handle knowledge selection', () => {
    const event = { target: { checked: true } } as any;
    component.getSelectedKnowledges(1, event);
    
    const selectedKnowledges = component.filterForm.get('selectedKnowledges')?.value;
    expect(selectedKnowledges).toContain(1);
  });

  it('should filter out "Conocimientos generales" section', () => {
    const generalKnowledgeSection = fixture.nativeElement.querySelector('label[for="section-3"]');
    expect(generalKnowledgeSection).toBeFalsy();
  });
});