import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';

/**
 * 🎯 TechnicianStateService
 * 
 * Servicio centralizado para gestionar el ESTADO de la búsqueda de técnicos.
 * 
 * RESPONSABILIDADES:
 * ✅ Mantener la lista completa de técnicos
 * ✅ Mantener los filtros seleccionados (secciones, conocimientos)
 * ✅ Mantener la lista filtrada (resultado final)
 * ✅ Proporcionar signals reactivas para que los componentes se actualicen automáticamente
 * 
 * NO hace:
 * ❌ Lógica compleja de filtrado (eso va en FilterService)
 * ❌ Llamadas HTTP (eso va en UserService, etc.)
 * ❌ Manipulación del DOM
 */
@Injectable({
  providedIn: 'root'
})
export class TechnicianStateService {
  
  // ========================================
  // 📊 ESTADO PRIVADO (signals)
  // ========================================
  
  /**
   * Lista completa de técnicos (sin filtrar)
   * Private porque solo este servicio debe modificarla directamente
   */
  private _allTechnicians: WritableSignal<User[]> = signal([]);
  
  /**
   * Lista de técnicos después de aplicar filtros
   */
  private _filteredTechnicians: WritableSignal<User[]> = signal([]);
  
  /**
   * Secciones seleccionadas en los filtros
   */
  private _selectedSections: WritableSignal<Section[]> = signal([]);
  
  /**
   * Conocimientos seleccionados en los filtros
   */
  private _selectedKnowledges: WritableSignal<Knowledge[]> = signal([]);
  
  /**
   * Estado de carga (útil para mostrar spinners)
   */
  private _isLoading: WritableSignal<boolean> = signal(true);
  
  // ========================================
  // 📖 GETTERS PÚBLICOS (read-only)
  // ========================================
  
  /**
   * Expone la lista completa de técnicos como READONLY
   * Los componentes pueden leerla pero NO modificarla directamente
   */
  readonly allTechnicians = this._allTechnicians.asReadonly();
  
  /**
   * Lista filtrada de técnicos (resultado final que se muestra en la UI)
   */
  readonly filteredTechnicians = this._filteredTechnicians.asReadonly();
  
  /**
   * Secciones actualmente seleccionadas
   */
  readonly selectedSections = this._selectedSections.asReadonly();
  
  /**
   * Conocimientos actualmente seleccionados
   */
  readonly selectedKnowledges = this._selectedKnowledges.asReadonly();
  
  /**
   * Estado de carga
   */
  readonly isLoading = this._isLoading.asReadonly();
  
  // ========================================
  // 🧮 COMPUTED SIGNALS (valores derivados)
  // ========================================
  
  /**
   * Número total de técnicos disponibles
   * Se actualiza automáticamente cuando cambia allTechnicians
   */
  readonly totalTechnicians = computed(() => this._allTechnicians().length);
  
  /**
   * Número de técnicos después de filtrar
   */
  readonly filteredCount = computed(() => this._filteredTechnicians().length);
  
  /**
   * ¿Hay filtros activos?
   * True si hay al menos una sección o conocimiento seleccionado
   */
  readonly hasActiveFilters = computed(() => 
    this._selectedSections().length > 0 || 
    this._selectedKnowledges().length > 0
  );
  
  /**
   * IDs de las secciones seleccionadas (útil para el filtrado)
   */
  readonly selectedSectionIds = computed(() => 
    this._selectedSections().map(s => s.id_section!)
  );
  
  /**
   * IDs de los conocimientos seleccionados
   */
  readonly selectedKnowledgeIds = computed(() => 
    this._selectedKnowledges().map(k => k.id_knowledge!)
  );
  
  // ========================================
  // 🔧 MÉTODOS PÚBLICOS (acciones)
  // ========================================
  
  /**
   * Establece la lista completa de técnicos
   * Llamado típicamente cuando se cargan los datos del servidor
   * Los técnicos se ordenan automáticamente por fecha de creación (más recientes primero)
   */
  setAllTechnicians(technicians: User[]): void {
    const sortedTechnicians = this.sortTechniciansByDate(technicians);
    this._allTechnicians.set(sortedTechnicians);
    // Al inicio, la lista filtrada es igual a la completa
    if (this._filteredTechnicians().length === 0) {
      this._filteredTechnicians.set(sortedTechnicians);
    }
  }
  
  /**
   * Actualiza la lista de técnicos filtrados
   * Llamado por el FilterService después de aplicar filtros
   */
  setFilteredTechnicians(technicians: User[]): void {
    this._filteredTechnicians.set(technicians);
  }
  
  /**
   * Ordena técnicos por fecha de creación (más recientes primero)
   * @private
   */
  private sortTechniciansByDate(technicians: User[]): User[] {
    return [...technicians].sort((a: User, b: User) => {
      return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
    });
  }
  
  /**
   * Actualiza las secciones seleccionadas
   */
  setSelectedSections(sections: Section[]): void {
    this._selectedSections.set(sections);
  }
  
  /**
   * Actualiza los conocimientos seleccionados
   */
  setSelectedKnowledges(knowledges: Knowledge[]): void {
    this._selectedKnowledges.set(knowledges);
  }
  
  /**
   * Limpia todos los filtros
   * Restaura la lista filtrada a la lista completa
   */
  clearFilters(): void {
    this._selectedSections.set([]);
    this._selectedKnowledges.set([]);
    this._filteredTechnicians.set(this._allTechnicians());
  }
  
  /**
   * Cambia el estado de carga
   */
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
  
  /**
   * Resetea todo el estado (útil al salir del componente)
   */
  reset(): void {
    this._allTechnicians.set([]);
    this._filteredTechnicians.set([]);
    this._selectedSections.set([]);
    this._selectedKnowledges.set([]);
    this._isLoading.set(true);
  }
}
