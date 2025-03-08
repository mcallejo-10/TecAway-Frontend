import { Component, HostListener, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';
import { RouterLink, RouterModule, } from '@angular/router';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';

@Component({
  selector: 'app-technicians',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule,  LoadingBarComponent],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  loading = true;
  technicians: User[] = [];

  filterForm!: FormGroup;
  formBuilder = inject(FormBuilder);

  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);

  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];
  selectedSections: Section[] = [];
  selectedKnowledges: Knowledge[] = [];
  setFilteredIds: number[] = this.filterService.filterTechnicians();
  filteredTechnicians: User[] = [];

  constructor(private fb: FormBuilder) { }
  // Función principal
ngOnInit() {
  this.loading = true;
  this.filterForm = this.fb.group({});
  
  this.sectionService.getSectionList().subscribe({
    next: (sectionsRes: any) => {
      this.sectionService.setSectionList(sectionsRes.data);
      this.sectionList = this.sectionService.sectionList();
      this.addSectionControls();
      this.filterService.setSelectedSections(this.sectionList);

      this.knowledgeService.getKnowledgeList().subscribe({
        next: (knowledgesRes: any) => {
          this.knowledgeList = knowledgesRes.data;
          this.addKnowledgeControls();
          this.addConocimientosGenerales();
          this.filterService.setSelectedKnowledges(this.knowledgeList);

          this.userService.getUserList().subscribe({
            next: (techRes: any) => {
              this.technicians = techRes.data;
              this.filteredTechnicians = this.technicians;
              this.filterService.setTechnicianList(this.technicians);
              this.loading = false; // Solo se ejecuta cuando todo ha terminado
            }
          });
        }
      });
    }
  });
}

// Función para cargar técnicos/usuarios
private loadTechnicians(): void {
  this.userService.getUserList().subscribe((res: any) => {
    this.technicians = res.data;
    this.filteredTechnicians = this.technicians;
    this.filterService.setTechnicianList(this.technicians);
  });
}

private loadSections(): void {
  this.sectionService.getSectionList().subscribe((res: any) => {
    this.sectionService.setSectionList(res.data);
    this.sectionList = this.sectionService.sectionList();
    
    this.addSectionControls();
    this.filterService.setSelectedSections(this.sectionList);
  });
}


private addSectionControls(): void {
  const sectionControls = this.sectionList.reduce((acc, section) => {
    acc[section.id_section!] = new FormControl(false);
    return acc;
  }, {} as { [key: string]: FormControl });
  
  this.filterForm.addControl('sections', this.fb.group(sectionControls));
}


private loadKnowledges(): void {
  this.knowledgeService.getKnowledgeList().subscribe((res: any) => {
    this.knowledgeList = res.data;
    
    this.addKnowledgeControls();
    this.addConocimientosGenerales();
    
    this.filterService.setSelectedKnowledges(this.knowledgeList);
  });
}


private addKnowledgeControls(): void {
  const knowledgeControls = this.knowledgeList.reduce((acc, knowledge) => {
    acc[knowledge.id_knowledge!] = new FormControl(false);
    return acc;
  }, {} as { [key: string]: FormControl });
  
  this.filterForm.addControl('knowledges', this.fb.group(knowledgeControls));
}

  isCheckedSection(id: number): boolean {
    return this.selectedSections.some((section) => section.id_section === id);
  }

  isCheckedKnowledge(id: number): boolean {
    return this.selectedKnowledges.some((knowledge) => knowledge.id_knowledge === id);
  }


  addConocimientosGenerales(): void {
    const section = this.sectionList.find(
      (section) => section.section === 'Conocimientos generales'
    );
    if (section) {
      this.selectedSections.push(section);                    
      const knowledeService = this.knowledgeList.filter(k => k.knowledge === section.section);     
      this.selectedKnowledges.push(knowledeService[0]);      
    }
  }

  getSelectedSections(id_section: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      const section = this.sectionList.find(
        (section) => section.id_section === id_section
      );
      if (section) {
        if (!this.selectedSections.some(s => s.id_section === id_section)) {
          this.selectedSections.push(section);
        }
        const knowledeService = this.knowledgeList.filter(k => k.knowledge === section.section!);

        this.selectedKnowledges.push(knowledeService[0]);
        this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      }
      this.filterService.setSelectedSections(this.selectedSections);

    } else {
      this.selectedSections = this.selectedSections.filter(
        (section) => section.id_section !== id_section
      );
      if (this.selectedSections.length === 0) {
        this.ngOnInit();
      } else {
        this.filterService.setSelectedSections(this.selectedSections);
      }
      this.selectedKnowledges = this.selectedKnowledges.filter(
        (knowledge) => knowledge.section_id !== id_section
      );
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
    }
    this.filterService.filterTechnicians();
    this.filterTechniciansById();
  }

  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      const knowledge = this.knowledgeList.find(
        (knowledge) => knowledge.id_knowledge === id_knowledge
      );
      if (knowledge) {
        if (!this.selectedKnowledges.some(k => k.id_knowledge === id_knowledge)) {
          this.selectedKnowledges.push(knowledge);
        }
      }
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      this.filterService.filterTechnicians();
    }
    else {
      this.selectedKnowledges = this.selectedKnowledges.filter(
        (knowledge) => knowledge.id_knowledge !== id_knowledge
      );
      if (this.selectedKnowledges.length === 0) {
        this.filterService.setSelectedKnowledges(this.knowledgeList);
      } else {
        this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      }

      this.filterService.filterTechnicians();
    }
    this.filterTechniciansById()
  }

  filterTechniciansById(): void {
    const filtredIds = this.filterService.filterTechnicians();

    const filteredTechnicians = this.technicians.filter(
      (technician) => technician.id_user && filtredIds.includes(technician.id_user)
    );
    this.filterService.techniciansFiltred.set(filteredTechnicians);
    this.filterService.filterTechnicians();
    this.filterService.techniciansFiltred();
  }


  toggleFilter() {
    const filterCard = document.querySelector('.filter-card');
    const overlay = document.querySelector('.filter-over    lay');

    if (filterCard && overlay) {
      filterCard.classList.toggle('show');
      overlay.classList.toggle('show');
      document.body.style.overflow = filterCard.classList.contains('show') ? 'hidden' : '';
    }
  }

  closeFilter() {
    const filterCard = document.querySelector('.filter-card');
    const overlay = document.querySelector('.filter-over    lay');

    if (filterCard && overlay) {
      filterCard.classList.remove('show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 768) {
      this.closeFilter();
    }
  }
}