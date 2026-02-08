import { Component, HostListener, inject, OnInit, ViewChild, ElementRef, Renderer2, signal, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../../services/userService/user.service';
import { UserListResponse } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { TechnicianStateService } from '../../services/state/technician-state.service';
import { DistanceFilterService } from '../../services/distance-filter/distance-filter.service';
import { TechnicianSortService, SortType } from '../../services/sort/technician-sort.service';
import { LocationService, LocationSuggestion } from '../../services/location/location.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section, SectionListResponse } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge, KnowledgeListResponse } from '../../interfaces/knowledge';
import { RouterModule } from '@angular/router';
import { LoadingBarComponent } from '../utils/loading-bar/loading-bar.component';
import { UserAvatarComponent } from '../utils/user-avatar/user-avatar.component';
import { DropdownComponent, DropdownOption } from '../utils/dropdown/dropdown.component';

@Component({
  selector: 'app-technicians',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule, LoadingBarComponent, UserAvatarComponent, DropdownComponent],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent implements OnInit {
  // Referencias al DOM para el filtro móvil
  @ViewChild('filterCard') filterCard!: ElementRef<HTMLDivElement>;
  @ViewChild('filterOverlay') filterOverlay!: ElementRef<HTMLDivElement>;

  // Subject para optimizar eventos de resize con debounce
  private resizeSubject = new Subject<void>();
  
  // 🔍 Subjects para optimizar búsqueda de ubicación
  private locationInputSubject = new Subject<string>();
  private radiusChangeSubject = new Subject<number>();

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
  distanceFilterService = inject(DistanceFilterService);
  technicianSortService = inject(TechnicianSortService);
  locationService = inject(LocationService);
  
  // ✨ NUEVO: Servicio de estado centralizado
  state = inject(TechnicianStateService);

  // Variables locales que SÍ son específicas del componente
  filterForm!: FormGroup;
  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];
  
  // 🔍 Autocomplete de ubicaciones
  locationSuggestions = signal<LocationSuggestion[]>([]);
  showSuggestions = signal<boolean>(false);

  // 🎨 Opciones para el dropdown de ordenamiento (reactivo)
  sortOptions = signal<DropdownOption[]>([
    { value: 'recent', label: 'Más recientes' },
    { value: 'name', label: 'Por nombre (A-Z)' }
  ]);

  isCheckedSection(id: number): boolean {
    // 🔄 Ahora usamos el estado del servicio en lugar de variable local
    return this.state.selectedSections().some((section) => section.id_section === id);
  }

  isCheckedKnowledge(id: number): boolean {
    // 🔄 Verificamos si el conocimiento está seleccionado
    return this.state.selectedKnowledges().some((knowledge) => knowledge.id_knowledge === id);
  }

  constructor() {
    // 🎨 Effect para actualizar opciones de ordenamiento según filtro de ubicación
    effect(() => {
      const hasLocation = this.state.hasLocationFilter();
      const baseOptions: DropdownOption[] = [
        { value: 'recent', label: 'Más recientes' },
        { value: 'name', label: 'Por nombre (A-Z)' }
      ];
      
      if (hasLocation) {
        baseOptions.push({ value: 'distance', label: 'Más cercanos' });
      }
      
      this.sortOptions.set(baseOptions);
    });
    
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

    // 🔍 Debounce para input de ubicación (esperar 500ms después de que el usuario deja de escribir)
    this.locationInputSubject.pipe(
      debounceTime(500),
      takeUntilDestroyed()
    ).subscribe(async (query) => {
      if (!query || query.trim().length < 2) {
        this.locationSuggestions.set([]);
        this.showSuggestions.set(false);
        return;
      }

      try {
        const suggestions = await this.locationService.getLocationSuggestions(query);
        this.locationSuggestions.set(suggestions);
        this.showSuggestions.set(suggestions.length > 0);
      } catch (error) {
        console.error('Error obteniendo sugerencias:', error);
        this.locationSuggestions.set([]);
        this.showSuggestions.set(false);
      }
    });

    // 🎯 Debounce para slider de radio (esperar 300ms después de que el usuario deja de mover)
    this.radiusChangeSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe((radius) => {
      this.state.setSearchRadius(radius);
      // 🔄 Volver a aplicar todos los filtros para asegurar que parte de la lista correcta
      this.applyFilters();
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
    const hasSectionFilters = this.state.selectedSections().length > 0;
    
    if (hasSectionFilters) {
      // Si hay filtros de sección/conocimiento, aplicarlos primero
      const filteredIds = this.filterService.filterTechnicians();
      this.filterTechniciansById(filteredIds);
    } else {
      // Si NO hay filtros de sección, usar todos los técnicos
      this.state.setFilteredTechnicians(this.state.allTechnicians());
    }
    
    // Después de filtrar por sección/conocimiento, aplicar distancia y ordenamiento
    this.applyDistanceFilter();
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

  // ========================================
  // 🆕 FILTRADO Y ORDENAMIENTO
  // ========================================

  /**
   * Aplica filtrado por distancia si hay ubicación del usuario
   * Llamado después de aplicar filtros de sección/conocimiento
   */
  applyDistanceFilter(): void {
    const userLocation = this.state.userLocation();
    const searchRadius = this.state.searchRadius();

    if (!userLocation || searchRadius === null) {
      // Si no hay ubicación/radio, no hay que filtrar por distancia
      this.applySorting();
      return;
    }

    // 🔑 IMPORTANTE: Siempre partir de la lista actual (ya filtrada por secciones si aplica)
    // NO partir de una lista previamente filtrada por distancia
    const currentList = this.state.filteredTechnicians();
    
    const distanceFiltered = this.distanceFilterService.filterByDistance(
      currentList,
      userLocation,
      searchRadius
    );

    this.state.setFilteredTechnicians(distanceFiltered);
    this.applySorting();
  }

  /**
   * Aplica el ordenamiento actual a la lista filtrada
   * Llamado después de cualquier cambio en filtros o tipo de ordenamiento
   */
  applySorting(): void {
    const currentFiltered = this.state.filteredTechnicians();
    const sortType = this.state.sortType();
    const userLocation = this.state.userLocation();

    const sorted = this.technicianSortService.sort(
      currentFiltered,
      sortType,
      userLocation || undefined
    );

    this.state.setFilteredTechnicians(sorted);
  }

  /**
   * Maneja cambio en el tipo de ordenamiento desde la UI
   */
  onSortTypeChange(sortType: string): void {
    this.state.setSortType(sortType as SortType);
    this.applySorting();
  }

  /**
   * Solicita ubicación del usuario y actualiza el estado
   * Llamado cuando usuario habilita búsqueda por distancia
   */
  async requestUserLocation(): Promise<void> {
    try {
      this.state.setLoading(true);
      const location = await this.locationService.getCurrentPosition();
      this.state.setUserLocation(location);
      // Establecer radio por defecto (ej: 20km)
      this.state.setSearchRadius(20);
      this.state.setSearchLocation('Tu ubicación'); // 🆕 Texto para geolocalización
      this.applyFilters();
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos.');
    } finally {
      this.state.setLoading(false);
    }
  }

  /**
   * Busca ubicación por ciudad/país escrito manualmente
   * Llama al backend para geocodificar (convertir ciudad → coordenadas)
   */
  async searchByLocation(locationQuery: string): Promise<void> {
    if (!locationQuery || locationQuery.trim() === '') {
      alert('Por favor, introduce una ciudad o país');
      return;
    }

    try {
      this.state.setLoading(true);
      
      // Llamar al backend para geocodificar
      const coords = await this.locationService.geocodeLocation(locationQuery);
      
      if (!coords) {
        alert(`No se encontró la ubicación: "${locationQuery}".\nIntenta con otra ciudad o sé más específico (ej: "Barcelona, España")`);
        return;
      }

      // Actualizar el estado con las coordenadas obtenidas
      this.state.setUserLocation(coords);
      this.state.setSearchRadius(20); // Radio por defecto: 20 km
      this.state.setSearchLocation(locationQuery.trim()); // 🏙️ Guardar el nombre de la ciudad
      
      // Ocultar sugerencias
      this.showSuggestions.set(false);
      
      // Aplicar filtros
      this.applyFilters();
      
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      alert('Hubo un error al buscar la ubicación. Por favor, inténtalo de nuevo.');
    } finally {
      this.state.setLoading(false);
    }
  }

  /**
   * 🔍 Maneja el input de búsqueda de ubicación para autocomplete
   * Se ejecuta mientras el usuario escribe (con debounce)
   */
  onLocationInput(query: string): void {
    // Emitir al subject, el debounce se encarga del resto
    this.locationInputSubject.next(query);
  }

  /**
   * 📍 Selecciona una sugerencia del dropdown
   * Actualiza el input y busca directamente
   */
  selectLocationSuggestion(suggestion: LocationSuggestion, inputElement: HTMLInputElement): void {
    // Formatear como "Ciudad, País"
    const locationText = `${suggestion.city}, ${suggestion.country}`;
    
    // Actualizar el input visualmente
    inputElement.value = locationText;
    
    // Ocultar dropdown
    this.showSuggestions.set(false);
    this.locationSuggestions.set([]);
    
    // Usar directamente las coordenadas de la sugerencia
    this.state.setUserLocation({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    this.state.setSearchRadius(20);
    this.state.setSearchLocation(locationText);
    
    // Aplicar filtros
    this.applyFilters();
  }

  /**
   * Limpia el filtro de ubicación/distancia
   */
  clearLocationFilter(): void {
    this.state.setUserLocation(null);
    this.state.setSearchRadius(null);
    this.state.setSearchLocation(null);
    // Volver a ordenar por reciente si estaba ordenado por distancia
    if (this.state.sortType() === 'distance') {
      this.state.setSortType('recent');
    }
    this.applyFilters();
  }

  /**
   * Actualiza el radio de búsqueda (con debounce)
   */
  onSearchRadiusChange(radius: number): void {
    // Emitir al subject, el debounce se encarga del resto
    this.radiusChangeSubject.next(radius);
  }

  /**
   * Limpia todos los filtros incluyendo distancia
   */
  clearAllFilters(): void {
    this.state.clearFilters();
    this.state.setSortType('recent');
    this.state.setAllTechnicians(this.state.allTechnicians());
  }
}