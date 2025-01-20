
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TechniciansComponent } from './technicians.component';
import { FilterService } from './services/filter.service';
import { BehaviorSubject } from 'rxjs';

describe('TechniciansComponent', () => {
  let component: TechniciansComponent;
  let fixture: ComponentFixture<TechniciansComponent>;
  let filterService: jasmine.SpyObj<FilterService>;

  const mockTechnicians = [
    {
      id_user: 1,
      name: 'John Doe',
      title: 'Senior Developer',
      description: 'Full stack developer with 5 years of experience',
      photo: 'path/to/photo.jpg'
    },
    {
      id_user: 2,
      name: 'Jane Smith',
      title: 'UX Designer',
      description: 'Creative designer specialized in user experience',
      photo: 'path/to/photo2.jpg'
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
    { id_knowledge: 3, section_id: 2, knowledge: 'Node.js' }
  ];

  beforeEach(async () => {
    filterService = jasmine.createSpyObj('FilterService', ['techniciansFiltred'], {
      techniciansFiltred: new BehaviorSubject(mockTechnicians)
    });

    await TestBed.configureTestingModule({
      imports: [
        TechniciansComponent,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: FilterService, useValue: filterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansComponent);
    component = fixture.componentInstance;
    component.sectionList = mockSections;
    component.knowledgeList = mockKnowledges;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display technicians list', () => {
    const techniciansElements = fixture.nativeElement.querySelectorAll('.card-technician');
    expect(techniciansElements.length).toBe(mockTechnicians.length);
  });

  it('should display "No hay técnicos disponibles" when list is empty', () => {
    filterService.techniciansFiltred.next([]);
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