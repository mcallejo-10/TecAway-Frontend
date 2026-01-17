import { Component, HostListener, inject, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../../services/userService/user.service';
import { UserListResponse } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { TechnicianStateService } from '../../services/state/technician-state.service';
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

  // 🎯 ESTADO CENTRALIZADO - Ahora viene del TechnicianStateService
  // Ya NO necesitamos estas variables locales:
  // ❌ loading, technicians, filteredTechnicians, selectedSections, selectedKnowledges
  
  // Inyección de servicios
  private fb = inject(FormBuilder);
  private renderer = inject(Renderer2);
  
  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);
  
  // ✨ NUEVO: Servicio de estado centralizado
  state = inject(TechnicianStateService);

  // Variables locales que SÍ son específicas del componente
  filterForm!: FormGroup;
  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];

  isCheckedSection(id: number): boolean {
    // 🔄 Ahora usamos el estado del servicio en lugar de variable local
    return this.state.selectedSections().some((section) => section.id_section === id);
  }

  isCheckedKnowledge(id: number): boolean {
    // 🔄 Verificamos si el conocimiento está seleccionado
    return this.state.selectedKnowledges().some((knowledge) => knowledge.id_knowledge === id);
  }

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
  // Inicializar estado de carga
  this.state.setLoading(true);
  this.filterForm = this.fb.group({});
  
  this.sectionService.getSectionList().subscribe({
    next: (sectionsRes: SectionListResponse) => {
      this.sectionService.setSectionList(sectionsRes.data);
      this.sectionList = this.sectionService.sectionList();
      this.addSectionControls();

      this.knowledgeService.getKnowledgeList().subscribe({
        next: (knowledgesRes: KnowledgeListResponse) => {
          this.knowledgeList = knowledgesRes.data;
          this.addKnowledgeControls();
          
          // Añadir Conocimientos generales por defecto
          this.addConocimientosGenerales();
          
          // 🔄 Guardamos en el estado las secciones/conocimientos iniciales
          this.state.setSelectedSections(this.state.selectedSections());
          this.state.setSelectedKnowledges(this.state.selectedKnowledges());

          this.userService.getUserList().subscribe({
            next: (techRes: UserListResponse) => {
              // ✅ Guardamos técnicos en el estado (se ordenan automáticamente)
              this.state.setAllTechnicians(techRes.data);
              
              // ✅ Finalizamos carga
              this.state.setLoading(false);
            }
          });
        }
      });
    }
  });
}

  // ========================================
  // 🔧 MÉTODOS AUXILIARES PRIVADOS
  // ========================================
  
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

  // Helper genérico para reducir duplicación de código
  private addItemToSelection<T>(
    item: T | undefined,
    selectedList: T[],
    checkDuplicate: (item: T) => boolean
  ): boolean {
    if (!item || selectedList.some(checkDuplicate)) return false;
    selectedList.push(item);
    return true;
  }

  // Método auxiliar simplificado - ya no necesitamos recargar todo
  private applyFilters(): void {
    const filteredIds = this.filterService.filterTechnicians();
    this.filterTechniciansById(filteredIds);
  }


  addConocimientosGenerales(): void {
    const section = this.sectionList.find(
      (section) => section.section === 'Conocimientos generales'
    );
    if (section) {
      const selectedSections = [section];
      const knowledgeService = this.knowledgeList.filter(k => k.knowledge === section.section);
      const selectedKnowledges = knowledgeService;
      
      // 🔄 Guardamos en el estado
      this.state.setSelectedSections(selectedSections);
      this.state.setSelectedKnowledges(selectedKnowledges);
    }
  }

  getSelectedSections(id_section: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    // 🔄 Trabajamos con el estado del servicio
    let selectedSections = [...this.state.selectedSections()];
    let selectedKnowledges = [...this.state.selectedKnowledges()];

    if (isChecked) {
      const section = this.sectionList.find(s => s.id_section === id_section);
      
      if (section && !selectedSections.some(s => s.id_section === id_section)) {
        selectedSections.push(section);
        
        const knowledge = this.knowledgeList.find(k => k.knowledge === section.section);
        if (knowledge) {
          selectedKnowledges.push(knowledge);
        }
      }
    } else {
      selectedSections = selectedSections.filter(s => s.id_section !== id_section);
      selectedKnowledges = selectedKnowledges.filter(k => k.section_id !== id_section);
      
      if (selectedSections.length === 0) {
        this.ngOnInit();
        return;
      }
    }
    
    // 🔄 Actualizamos SOLO el estado centralizado (FilterService lo lee de allí)
    this.state.setSelectedSections(selectedSections);
    this.state.setSelectedKnowledges(selectedKnowledges);
    
    this.applyFilters();
  }

  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    // 🔄 Trabajamos con el estado del servicio
    let selectedKnowledges = [...this.state.selectedKnowledges()];

    if (isChecked) {
      const knowledge = this.knowledgeList.find(k => k.id_knowledge === id_knowledge);
      if (knowledge && !selectedKnowledges.some(k => k.id_knowledge === id_knowledge)) {
        selectedKnowledges.push(knowledge);
      }
    } else {
      selectedKnowledges = selectedKnowledges.filter(k => k.id_knowledge !== id_knowledge);
      
      if (selectedKnowledges.length === 0) {
        selectedKnowledges = this.knowledgeList;
      }
    }
    
    // 🔄 Actualizamos SOLO el estado centralizado (FilterService lo lee de allí)
    this.state.setSelectedKnowledges(selectedKnowledges);
    
    this.applyFilters();
  }

  filterTechniciansById(filteredIds: number[]): void {
    const allTechs = this.state.allTechnicians(); // 🔄 Leemos del estado
    const filteredTechnicians = allTechs.filter(
      (technician) => technician.id_user && filteredIds.includes(technician.id_user)
    );
    
    // ✅ Solo actualizamos el estado centralizado
    this.state.setFilteredTechnicians(filteredTechnicians);
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