import { Injectable, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { Coordinates, LocationService } from '../location/location.service';

/**
 * Tipos de ordenamiento disponibles
 */
export type SortType = 'recent' | 'name' | 'distance' | 'rating';

/**
 * 🔤 TechnicianSortService
 * 
 * Servicio especializado para ordenar técnicos por diferentes criterios.
 * 
 * RESPONSABILIDADES:
 * ✅ Ordenar por fecha de creación (más recientes primero)
 * ✅ Ordenar alfabéticamente por nombre
 * ✅ Ordenar por distancia (más cercanos primero)
 * ✅ Manejar técnicos sin información de sorting
 */
@Injectable({
  providedIn: 'root'
})
export class TechnicianSortService {

  private locationService = inject(LocationService);

  /**
   * Ordena técnicos según el tipo especificado
   */
  sort(
    technicians: User[],
    sortType: SortType,
    userLocation?: Coordinates
  ): User[] {
    const sorted = [...technicians]; // No mutar el original

    switch (sortType) {
      case 'recent':
        return this.sortByDate(sorted);
      case 'name':
        return this.sortByName(sorted);
      case 'distance':
        return this.sortByDistance(sorted, userLocation);
      case 'rating':
        // TODO: Implementar cuando tengamos ratings
        return sorted;
      default:
        return sorted;
    }
  }

  /**
   * Ordena por fecha de creación (más recientes primero)
   */
  private sortByDate(technicians: User[]): User[] {
    return technicians.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Descendente (más recientes primero)
    });
  }

  /**
   * Ordena alfabéticamente por nombre
   */
  private sortByName(technicians: User[]): User[] {
    return technicians.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB, 'es'); // Comparación locale-aware
    });
  }

  /**
   * Ordena por distancia (más cercanos primero)
   * Requiere userLocation
   */
  private sortByDistance(technicians: User[], userLocation?: Coordinates): User[] {
    if (!userLocation) {
      // Si no hay ubicación, ordenar por fecha como fallback
      return this.sortByDate(technicians);
    }

    return technicians.sort((a, b) => {
      const distA = this.getDistance(a, userLocation);
      const distB = this.getDistance(b, userLocation);

      // Los sin coordenadas al final
      if (distA === null && distB === null) return 0;
      if (distA === null) return 1;
      if (distB === null) return -1;

      // Ascendente (más cercanos primero)
      return distA - distB;
    });
  }

  /**
   * Calcula distancia o retorna null si no es posible
   * @private
   */
  private getDistance(technician: User, userLocation: Coordinates): number | null {
    if (
      !technician.latitude ||
      !technician.longitude ||
      !this.locationService.isValidCoordinates({
        latitude: technician.latitude,
        longitude: technician.longitude
      })
    ) {
      return null;
    }

    return this.locationService.calculateDistance(userLocation, {
      latitude: technician.latitude,
      longitude: technician.longitude
    });
  }

  /**
   * Obtiene las opciones de ordenamiento disponibles
   */
  getAvailableSortOptions(hasLocation: boolean): { value: SortType; label: string }[] {
    const options: { value: SortType; label: string }[] = [
      { value: 'recent', label: 'Más recientes' },
      { value: 'name', label: 'Por nombre (A-Z)' }
    ];

    if (hasLocation) {
      options.push({ value: 'distance', label: 'Más cercanos' });
    }

    return options;
  }
}
