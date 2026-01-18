import { Injectable, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { Coordinates, LocationService } from '../location/location.service';

/**
 * 📏 DistanceFilterService
 * 
 * Servicio especializado para filtrar técnicos por distancia.
 * 
 * RESPONSABILIDADES:
 * ✅ Filtrar técnicos dentro de un radio de búsqueda
 * ✅ Calcular distancias para cada técnico
 * ✅ Manejar técnicos con/sin coordenadas
 * ✅ Considerar si el técnico puede desplazarse
 */
@Injectable({
  providedIn: 'root'
})
export class DistanceFilterService {

  private locationService = inject(LocationService);

  /**
   * Filtra técnicos por distancia desde una ubicación
   * 
   * @param technicians Lista de técnicos a filtrar
   * @param userLocation Ubicación del usuario (coordenadas)
   * @param radiusKm Radio de búsqueda en kilómetros
   * @returns Técnicos dentro del radio de búsqueda
   * 
   * LÓGICA:
   * - Si el técnico puede desplazarse: se incluye si está en el país
   * - Si NO puede desplazarse: se incluye si está dentro del radio
   */
  filterByDistance(
    technicians: User[],
    userLocation: Coordinates | null,
    radiusKm: number | null
  ): User[] {
    // Si no hay ubicación o radio, retornar todos
    if (!userLocation || radiusKm === null) {
      return technicians;
    }

    return technicians.filter(tech => {
      // Si el técnico no tiene coordenadas, no se incluye en búsqueda por distancia
      if (
        !tech.latitude ||
        !tech.longitude ||
        !this.locationService.isValidCoordinates({
          latitude: tech.latitude,
          longitude: tech.longitude
        })
      ) {
        return false;
      }

      const techCoords: Coordinates = {
        latitude: tech.latitude!,
        longitude: tech.longitude!
      };

      const distance = this.locationService.calculateDistance(userLocation, techCoords);
      
      if (distance === null) {
        return false;
      }

      // Si el técnico puede desplazarse, solo importa que esté en el país
      // (el país se determina en backend, aquí aceptamos cualquiera dentro del radio)
      if (tech.can_move) {
        // Si puede desplazarse, es más flexible: aceptamos hasta el doble del radio
        return distance <= radiusKm * 2;
      }

      // Si NO puede desplazarse, debe estar dentro del radio exacto
      return distance <= radiusKm;
    });
  }

  /**
   * Calcula la distancia entre el usuario y un técnico
   * @returns Distancia en km, o null si no se puede calcular
   */
  calculateDistanceToTechnician(
    userLocation: Coordinates | null,
    technician: User
  ): number | null {
    if (!userLocation) {
      return null;
    }

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

    const techCoords: Coordinates = {
      latitude: technician.latitude!,
      longitude: technician.longitude!
    };

    return this.locationService.calculateDistance(userLocation, techCoords);
  }

  /**
   * Enriquece técnicos con información de distancia
   * Crea un nuevo objeto con propiedad 'distance'
   */
  enrichWithDistance(
    technicians: User[],
    userLocation: Coordinates | null
  ): (User & { distance?: number })[] {
    if (!userLocation) {
      return technicians;
    }

    return technicians.map(tech => {
      const distance = this.calculateDistanceToTechnician(userLocation, tech);
      return {
        ...tech,
        ...(distance !== null && { distance })
      };
    });
  }
}
