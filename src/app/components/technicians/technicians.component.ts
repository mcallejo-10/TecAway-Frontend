import { Component, HostListener, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { User, UserListResponse } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section, SectionListResponse } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge, KnowledgeListResponse } from '../../interfaces/knowledge';
import { RouterModule } from '@angular/router';
import { LoadingBarComponent } from '../utils/loading-bar/loading-bar.component';
import { UserAvatarComponent } from '../utils/user-avatar/user-avatar.component';

@Component({
  selector: 'app-technicians',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule, LoadingBarComponent, UserAvatarComponent],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent implements OnInit {

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
  private fb = inject(FormBuilder);

ngOnInit() {
  this.loading = true;
  this.filterForm = this.fb.group({});
  
  this.sectionService.getSectionList().subscribe({
    next: (sectionsRes: SectionListResponse) => {
      this.sectionService.setSectionList(sectionsRes.data);
      this.sectionList = this.sectionService.sectionList();
      this.addSectionControls();
      this.filterService.setSelectedSections(this.sectionList);

      this.knowledgeService.getKnowledgeList().subscribe({
        next: (knowledgesRes: KnowledgeListResponse) => {
          this.knowledgeList = knowledgesRes.data;
          this.addKnowledgeControls();
          this.addConocimientosGenerales();
          this.filterService.setSelectedKnowledges(this.knowledgeList);

          this.userService.getUserList().subscribe({
            next: (techRes: UserListResponse) => {
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

private loadTechnicians(): void {
  this.userService.getUserList().subscribe((res: UserListResponse) => {
    this.technicians = res.data;
    this.filteredTechnicians = this.technicians;
    this.filterService.setTechnicianList(this.technicians);
  });
}

private addSectionControls(): void {
  const sectionControls = this.sectionList.reduce((acc, section) => {
    acc[section.id_section!] = new FormControl(false);
    return acc;
  }, {} as Record<string, FormControl>);
  
  this.filterForm.addControl('sections', this.fb.group(sectionControls));
}

private addKnowledgeControls(): void {
  const knowledgeControls = this.knowledgeList.reduce((acc, knowledge) => {
    acc[knowledge.id_knowledge!] = new FormControl(false);
    return acc;
  }, {} as Record<string, FormControl>);
  
  this.filterForm.addControl('knowledges', this.fb.group(knowledgeControls));
}

  isCheckedSection(id: number): boolean {
    return this.selectedSections.some((section) => section.id_section === id);
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
    const overlay = document.querySelector('.filter-overlay');

    if (filterCard && overlay) {
      filterCard.classList.toggle('show');
      overlay.classList.toggle('show');
      document.body.style.overflow = filterCard.classList.contains('show') ? 'hidden' : '';
    }
  }

  closeFilter() {
    const filterCard = document.querySelector('.filter-card');
    const overlay = document.querySelector('.filter-overlay');

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

  // 🆕 Método para calcular el tamaño del avatar según el breakpoint
  getAvatarSize(): number {
    if (typeof window === 'undefined') return 45; // SSR fallback
    
    const width = window.innerWidth;
    
    // Usar los mismos breakpoints que definimos en SCSS
    if (width <= 575) {
      return 80; // xs: tamaño móvil pequeño
    } else if (width <= 767) {
      return 70; // sm: móvil grande
    } else if (width <= 991) {
      return 45; // md: el problemático - MUY PEQUEÑO
    } else if (width <= 1199) {
      return 70; // lg: escritorio pequeño
    } else {
      return 100; // xl+: escritorio grande
    }
  }
}