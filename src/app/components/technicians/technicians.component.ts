import { Component, HostListener, inject, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  // Referencias al DOM para el filtro móvil
  @ViewChild('filterCard') filterCard!: ElementRef<HTMLDivElement>;
  @ViewChild('filterOverlay') filterOverlay!: ElementRef<HTMLDivElement>;

  // Subject para optimizar eventos de resize con debounce
  private resizeSubject = new Subject<void>();

  loading = true;
  technicians: User[] = [];

  filterForm!: FormGroup;
  formBuilder = inject(FormBuilder);

  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);
  private renderer = inject(Renderer2);

  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];
  selectedSections: Section[] = [];
  selectedKnowledges: Knowledge[] = [];
  setFilteredIds: number[] = this.filterService.filterTechnicians();
  filteredTechnicians: User[] = [];
  private fb = inject(FormBuilder);

  constructor() {
    // Configurar debounce para resize - espera 300ms de inactividad antes de ejecutar
    this.resizeSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed() // Limpieza automática al destruir componente
    ).subscribe(() => {
      // Solo se ejecuta UNA VEZ después de que el usuario termina de redimensionar
      if (window.innerWidth >= 768) {
        this.closeFilter();
      }
    });
  }

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

  // Helpers genéricos para reducir duplicación de código
  private addItemToSelection<T>(
    item: T | undefined,
    selectedList: T[],
    checkDuplicate: (item: T) => boolean
  ): boolean {
    if (!item || selectedList.some(checkDuplicate)) return false;
    selectedList.push(item);
    return true;
  }

  private applyFilters(): void {
    const filteredIds = this.filterService.filterTechnicians();
    this.filterTechniciansById(filteredIds);
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
      const section = this.sectionList.find(s => s.id_section === id_section);
      
      if (this.addItemToSelection(section, this.selectedSections, s => s.id_section === id_section)) {
        const knowledge = this.knowledgeList.find(k => k.knowledge === section!.section);
        if (knowledge) this.selectedKnowledges.push(knowledge);
        this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      }
      this.filterService.setSelectedSections(this.selectedSections);
    } else {
      this.selectedSections = this.selectedSections.filter(s => s.id_section !== id_section);
      this.selectedKnowledges = this.selectedKnowledges.filter(k => k.section_id !== id_section);
      
      if (this.selectedSections.length === 0) {
        this.ngOnInit();
        return;
      }
      
      this.filterService.setSelectedSections(this.selectedSections);
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
    }
    this.applyFilters();
  }

  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      const knowledge = this.knowledgeList.find(k => k.id_knowledge === id_knowledge);
      this.addItemToSelection(knowledge, this.selectedKnowledges, k => k.id_knowledge === id_knowledge);
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
    } else {
      this.selectedKnowledges = this.selectedKnowledges.filter(k => k.id_knowledge !== id_knowledge);
      
      const knowledgesToSet = this.selectedKnowledges.length === 0 
        ? this.knowledgeList 
        : this.selectedKnowledges;
      this.filterService.setSelectedKnowledges(knowledgesToSet);
    }
    this.applyFilters();
  }

  filterTechniciansById(filteredIds: number[]): void {
    const filteredTechnicians = this.technicians.filter(
      (technician) => technician.id_user && filteredIds.includes(technician.id_user)
    );
    this.filterService.techniciansFiltred.set(filteredTechnicians);
  }


  // Método unificado para controlar la visibilidad del filtro - elimina duplicación
  private setFilterVisibility(show: boolean): void {
    if (!this.filterCard || !this.filterOverlay) return;
    
    const action = show ? 'addClass' : 'removeClass';
    this.renderer[action](this.filterCard.nativeElement, 'show');
    this.renderer[action](this.filterOverlay.nativeElement, 'show');
    document.body.style.overflow = show ? 'hidden' : '';
  }

  toggleFilter() {
    const isShown = this.filterCard.nativeElement.classList.contains('show');
    this.setFilterVisibility(!isShown);
  }

  closeFilter() {
    this.setFilterVisibility(false);
  }

  @HostListener('window:resize')
  onResize() {
    // Solo emite evento al Subject, el debounce se encarga del resto
    this.resizeSubject.next();
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