import { TestBed } from '@angular/core/testing';
import { DistanceFilterService } from './distance-filter.service';
import { LocationService, Coordinates } from '../location/location.service';
import { User } from '../../interfaces/user';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('DistanceFilterService', () => {
  let service: DistanceFilterService;

  // Mock data
  const madridCoords: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
  const barcelonaCoords: Coordinates = { latitude: 41.3851, longitude: 2.1734 };
  const nearByCoords: Coordinates = { latitude: 40.4178, longitude: -3.7048 }; // ~130m from Madrid

  const mockTechnicians: User[] = [
    {
      id_user: 1,
      email: 'tech1@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_1,
      name: 'Tech Madrid',
      town: 'Madrid',
      country: 'ES',
      roles: ['user'],
      can_move: false,
      latitude: madridCoords.latitude,
      longitude: madridCoords.longitude
    },
    {
      id_user: 2,
      email: 'tech2@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_2,
      name: 'Tech Barcelona',
      town: 'Barcelona',
      country: 'ES',
      roles: ['user'],
      can_move: true,
      latitude: barcelonaCoords.latitude,
      longitude: barcelonaCoords.longitude
    },
    {
      id_user: 3,
      email: 'tech3@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Tech No Coords',
      town: 'Sevilla',
      country: 'ES',
      roles: ['user'],
      can_move: false
      // Sin coordenadas
    },
    {
      id_user: 4,
      email: 'tech4@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Tech Nearby',
      town: 'Madrid',
      country: 'ES',
      roles: ['user'],
      can_move: false,
      latitude: nearByCoords.latitude,
      longitude: nearByCoords.longitude
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DistanceFilterService, LocationService]
    });
    service = TestBed.inject(DistanceFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('filterByDistance', () => {
    it('should return all technicians if no location provided', () => {
      const result = service.filterByDistance(mockTechnicians, null, 50);
      
      expect(result.length).toBe(mockTechnicians.length);
    });

    it('should return all technicians if no radius provided', () => {
      const result = service.filterByDistance(mockTechnicians, madridCoords, null);
      
      expect(result.length).toBe(mockTechnicians.length);
    });

    it('should filter technicians within radius (no mobility)', () => {
      // Madrid center, 20 km radius
      // Tech Madrid (0 km) - incluir
      // Tech Barcelona (504 km) - excluir
      // Tech Nearby (0.1 km) - incluir
      // Tech No Coords - excluir
      
      const result = service.filterByDistance(mockTechnicians, madridCoords, 20);
      
      expect(result.length).toBe(2); // Madrid y Nearby
      expect(result.some(t => t.id_user === 1)).toBe(true);
      expect(result.some(t => t.id_user === 4)).toBe(true);
    });

    it('should exclude technicians without coordinates', () => {
      const result = service.filterByDistance(mockTechnicians, madridCoords, 500);
      
      // No debería incluir al tech sin coordenadas (id: 3)
      expect(result.some(t => t.id_user === 3)).toBe(false);
    });

    it('should be more flexible with mobile technicians (can_move=true)', () => {
      // Barcelona está a 504 km, pero puede desplazarse
      // Con radio 20 km normal, pero 40 km para móviles (2x)
      
      const result = service.filterByDistance(mockTechnicians, madridCoords, 250);
      
      // Tech Barcelona debería estar excluido (504 km > 500 km)
      expect(result.some(t => t.id_user === 2)).toBe(false);
    });

    it('should include mobile technicians within 2x radius', () => {
      // Barcelona está a 504 km
      // Con radio 300 km: 300 * 2 = 600 km (incluir)
      
      const result = service.filterByDistance(mockTechnicians, madridCoords, 300);
      
      // Tech Barcelona debería estar incluido (504 km < 600 km y puede_move=true)
      expect(result.some(t => t.id_user === 2)).toBe(true);
    });
  });

  describe('calculateDistanceToTechnician', () => {
    it('should return null if no user location', () => {
      const distance = service.calculateDistanceToTechnician(null, mockTechnicians[0]);
      
      expect(distance).toBeNull();
    });

    it('should return null if technician has no coordinates', () => {
      const distance = service.calculateDistanceToTechnician(madridCoords, mockTechnicians[2]);
      
      expect(distance).toBeNull();
    });

    it('should calculate distance correctly', () => {
      const distance = service.calculateDistanceToTechnician(madridCoords, mockTechnicians[0]);
      
      expect(distance).toBe(0); // Mismo punto
    });

    it('should calculate long distance correctly', () => {
      const distance = service.calculateDistanceToTechnician(madridCoords, mockTechnicians[1]);
      
      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(510);
    });

    it('should calculate short distance correctly', () => {
      const distance = service.calculateDistanceToTechnician(madridCoords, mockTechnicians[3]);
      
      expect(distance).toBeGreaterThanOrEqual(0.1);
      expect(distance).toBeLessThan(0.2);
    });
  });

  describe('enrichWithDistance', () => {
    it('should return technicians as-is if no location', () => {
      const result = service.enrichWithDistance(mockTechnicians, null);
      
      expect(result.length).toBe(mockTechnicians.length);
      expect(result[0].distance).toBeUndefined();
    });

    it('should add distance property to technicians', () => {
      const result = service.enrichWithDistance(mockTechnicians, madridCoords);
      
      expect(result.length).toBe(mockTechnicians.length);
      expect(result[0].distance).toBe(0); // Tech Madrid
      expect(result[2].distance).toBeUndefined(); // Tech No Coords
    });

    it('should calculate distances correctly for all technicians', () => {
      const result = service.enrichWithDistance(mockTechnicians, madridCoords);
      
      // Tech Madrid: 0 km
      expect(result[0].distance).toBe(0);
      
      // Tech Barcelona: ~504 km
      expect(result[1].distance).toBeGreaterThan(500);
      expect(result[1].distance).toBeLessThan(510);
      
      // Tech No Coords: undefined
      expect(result[2].distance).toBeUndefined();
      
      // Tech Nearby: ~0.1 km
      expect(result[3].distance).toBeGreaterThanOrEqual(0.1);
      expect(result[3].distance).toBeLessThan(0.2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty technician list', () => {
      const result = service.filterByDistance([], madridCoords, 50);
      
      expect(result.length).toBe(0);
    });

    it('should handle invalid coordinates in technicians', () => {
      const invalidTech: User = {
        id_user: 999,
        email: 'invalid@test.com',
        password: 'test',
        name: 'Invalid',
        town: 'Unknown',
        country: 'XX',
        roles: ['user'],
        latitude: 999, // Invalid
        longitude: 999 // Invalid
      };

      const result = service.filterByDistance([invalidTech], madridCoords, 50);
      
      expect(result.length).toBe(0);
    });

    it('should handle very small radius', () => {
      const result = service.filterByDistance(mockTechnicians, madridCoords, 0.05);
      
      // Solo el mismo punto exactamente
      expect(result.length).toBe(1);
      expect(result[0].id_user).toBe(1);
    });

    it('should handle very large radius', () => {
      const result = service.filterByDistance(mockTechnicians, madridCoords, 10000);
      
      // Todos los que tienen coordenadas
      expect(result.some(t => t.id_user === 1)).toBe(true);
      expect(result.some(t => t.id_user === 2)).toBe(true);
      expect(result.some(t => t.id_user === 3)).toBe(false); // Sin coords
      expect(result.some(t => t.id_user === 4)).toBe(true);
    });
  });
});
