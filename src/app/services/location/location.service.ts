import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para coordenadas geográficas
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Interfaz para ubicación completa
 */
export interface Location {
  coordinates: Coordinates;
  address?: string;
  city?: string;
  postalCode?: string;
}

/**
 * 📍 LocationService
 * 
 * Servicio para manejar operaciones de geolocalización:
 * - Obtener ubicación actual del usuario
 * - Calcular distancias entre puntos
 * - Geocodificación (convertir dirección a coordenadas)
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private http = inject(HttpClient);
  private apiUrl = environment.endpoint;

  /**
   * Obtiene la ubicación actual del usuario usando el API de Geolocalización del navegador
   * @returns Promise con las coordenadas o null si falla
   */
  async getCurrentPosition(): Promise<Coordinates | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current position:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param from Coordenadas del punto de origen
   * @param to Coordenadas del punto de destino
   * @returns Distancia en kilómetros
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Radio de la Tierra en km
    
    const lat1Rad = this.toRadians(from.latitude);
    const lat2Rad = this.toRadians(to.latitude);
    const deltaLatRad = this.toRadians(to.latitude - from.latitude);
    const deltaLonRad = this.toRadians(to.longitude - from.longitude);

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Convierte grados a radianes
   * @private
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Valida si unas coordenadas son válidas
   */
  isValidCoordinates(coords: Coordinates | null | undefined): coords is Coordinates {
    if (!coords) return false;
    
    return (
      typeof coords.latitude === 'number' &&
      typeof coords.longitude === 'number' &&
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  }

  /**
   * 🔍 Obtiene sugerencias de ciudades/países desde el backend
   * Usado para autocomplete mientras el usuario escribe
   * 
   * @param query Texto de búsqueda (mínimo 2 caracteres)
   * @param limit Número máximo de resultados (default: 5)
   * @returns Array de sugerencias con coordenadas
   */
  async getLocationSuggestions(query: string, limit = 5): Promise<LocationSuggestion[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await firstValueFrom(
        this.http.get<LocationSuggestion[]>(
          `${this.apiUrl}/api/geocode/autocomplete`,
          { params: { query: query.trim(), limit: limit.toString() } }
        )
      );

      return response || [];

    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      return [];
    }
  }

  /**
   * Formatea la distancia para mostrar al usuario
   * @param distanceKm Distancia en kilómetros
   * @returns String formateado (ej: "5.2 km" o "850 m")
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }
}

/**
 * Interfaz para sugerencias de ubicación (autocomplete)
 */
export interface LocationSuggestion {
  display_name: string;  // "Barcelona, Cataluña, España"
  city: string;          // "Barcelona"
  state?: string;        // "Cataluña"
  country: string;       // Código ISO (ej: "ES", "AR")
  latitude: number;
  longitude: number;
}
