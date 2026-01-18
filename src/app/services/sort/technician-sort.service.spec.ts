import { TestBed } from '@angular/core/testing';
import { TechnicianSortService, SortType } from './technician-sort.service';
import { LocationService, Coordinates } from '../location/location.service';
import { User } from '../../interfaces/user';
import { TEST_CREDENTIALS } from '../../../testing/test-constants';

describe('TechnicianSortService', () => {
  let service: TechnicianSortService;

  const madridCoords: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
  const barcelonaCoords: Coordinates = { latitude: 41.3851, longitude: 2.1734 };
  const nearByCoords: Coordinates = { latitude: 40.4178, longitude: -3.7048 };

  const mockTechnicians: User[] = [
    {
      id_user: 1,
      email: 'zoe@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_1,
      name: 'Zoe Martinez',
      town: 'Madrid',
      country: 'ES',
      roles: ['user'],
      created_at: new Date('2025-01-10'),
      latitude: madridCoords.latitude,
      longitude: madridCoords.longitude
    },
    {
      id_user: 2,
      email: 'alice@test.com',
      password: TEST_CREDENTIALS.HASHED_PASSWORD_2,
      name: 'Alice García',
      town: 'Barcelona',
      country: 'ES',
      roles: ['user'],
      created_at: new Date('2025-01-15'),
      latitude: barcelonaCoords.latitude,
      longitude: barcelonaCoords.longitude
    },
    {
      id_user: 3,
      email: 'bob@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Bob López',
      town: 'Valencia',
      country: 'ES',
      roles: ['user'],
      created_at: new Date('2025-01-05')
      // Sin coordenadas
    },
    {
      id_user: 4,
      email: 'carlo@test.com',
      password: TEST_CREDENTIALS.SIMPLE_PASSWORD,
      name: 'Carlo Rossi',
      town: 'Madrid',
      country: 'ES',
      roles: ['user'],
      created_at: new Date('2025-01-12'),
      latitude: nearByCoords.latitude,
      longitude: nearByCoords.longitude
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TechnicianSortService, LocationService]
    });
    service = TestBed.inject(TechnicianSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sort', () => {
    it('should sort by recent date', () => {
      const result = service.sort(mockTechnicians, 'recent');
      
      // Alice (2025-01-15) > Zoe (2025-01-10) > Carlo (2025-01-12)
      expect(result[0].id_user).toBe(2); // Alice - más reciente
      expect(result[1].id_user).toBe(4); // Carlo
      expect(result[2].id_user).toBe(1); // Zoe
      expect(result[3].id_user).toBe(3); // Bob - más antiguo
    });

    it('should sort by name', () => {
      const result = service.sort(mockTechnicians, 'name');
      
      // Alice < Bob < Carlo < Zoe (alfabético)
      expect(result[0].name).toBe('Alice García');
      expect(result[1].name).toBe('Bob López');
      expect(result[2].name).toBe('Carlo Rossi');
      expect(result[3].name).toBe('Zoe Martinez');
    });

    it('should sort by distance', () => {
      const result = service.sort(mockTechnicians, 'distance', madridCoords);
      
      // Zoe (Madrid, 0km) < Carlo (nearby, ~0.1km) < Alice (Barcelona, 504km) < Bob (no coords)
      expect(result[0].id_user).toBe(1); // Zoe - 0 km
      expect(result[1].id_user).toBe(4); // Carlo - ~0.1 km
      expect(result[2].id_user).toBe(2); // Alice - 504 km
      expect(result[3].id_user).toBe(3); // Bob - sin coordenadas
    });

    it('should fallback to recent sorting if no location for distance', () => {
      const result = service.sort(mockTechnicians, 'distance');
      
      // Debería hacer sort por fecha (fallback)
      expect(result[0].id_user).toBe(2); // Alice - más reciente
    });

    it('should not mutate original array', () => {
      const original = [...mockTechnicians];
      const originalIds = original.map(t => t.id_user);
      
      service.sort(mockTechnicians, 'name');
      
      const currentIds = mockTechnicians.map(t => t.id_user);
      expect(currentIds).toEqual(originalIds);
    });
  });

  describe('sortByDate (private)', () => {
    it('should sort most recent first', () => {
      const result = service.sort([...mockTechnicians], 'recent');
      
      expect(result[0].created_at).toEqual(new Date('2025-01-15'));
      expect(result[result.length - 1].created_at).toEqual(new Date('2025-01-05'));
    });

    it('should handle technicians without created_at', () => {
      const techWithoutDate: User = {
        id_user: 99,
        email: 'test@test.com',
        password: 'test',
        name: 'Test User',
        town: 'Test',
        country: 'ES',
        roles: ['user']
        // Sin created_at
      };

      const result = service.sort([techWithoutDate, ...mockTechnicians], 'recent');
      
      expect(result).toBeDefined();
      expect(result.length).toBe(5);
    });
  });

  describe('sortByName (private)', () => {
    it('should sort alphabetically', () => {
      const result = service.sort([...mockTechnicians], 'name');
      
      const names = result.map(t => t.name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b, 'es'));
      
      expect(names).toEqual(sorted);
    });

    it('should handle special characters in names', () => {
      const techs: User[] = [
        {
          id_user: 1,
          email: 'test1@test.com',
          password: 'test',
          name: 'Ángel',
          town: 'Test',
          country: 'ES',
          roles: ['user']
        },
        {
          id_user: 2,
          email: 'test2@test.com',
          password: 'test',
          name: 'Antonio',
          town: 'Test',
          country: 'ES',
          roles: ['user']
        }
      ];

      const result = service.sort(techs, 'name');
      
      expect(result[0].name).toBe('Ángel'); // Á comes before A in Spanish
      expect(result[1].name).toBe('Antonio');
    });
  });

  describe('sortByDistance (private)', () => {
    it('should sort by distance from location', () => {
      const result = service.sort([...mockTechnicians], 'distance', madridCoords);
      
      // Verificar orden de distancias
      expect(result[0].id_user).toBe(1); // Zoe - 0 km
      expect(result[1].id_user).toBe(4); // Carlo - ~0.1 km
      expect(result[2].id_user).toBe(2); // Alice - ~504 km
    });

    it('should put technicians without coordinates at the end', () => {
      const result = service.sort([...mockTechnicians], 'distance', madridCoords);
      
      expect(result[result.length - 1].id_user).toBe(3); // Bob sin coords
    });

    it('should handle all technicians without coordinates', () => {
      const techsNoCoords = mockTechnicians.map(t => ({
        ...t,
        latitude: undefined,
        longitude: undefined
      }));

      const result = service.sort(techsNoCoords, 'distance', madridCoords);
      
      expect(result.length).toBe(techsNoCoords.length);
    });
  });

  describe('getAvailableSortOptions', () => {
    it('should return basic options when no location', () => {
      const options = service.getAvailableSortOptions(false);
      
      expect(options.length).toBe(2);
      expect(options.map(o => o.value)).toEqual(['recent', 'name']);
    });

    it('should include distance option when location available', () => {
      const options = service.getAvailableSortOptions(true);
      
      expect(options.length).toBe(3);
      expect(options.map(o => o.value)).toEqual(['recent', 'name', 'distance']);
    });

    it('should have localized labels', () => {
      const options = service.getAvailableSortOptions(false);
      
      expect(options[0].label).toBe('Más recientes');
      expect(options[1].label).toBe('Por nombre (A-Z)');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const result = service.sort([], 'name');
      
      expect(result).toEqual([]);
    });

    it('should handle single technician', () => {
      const result = service.sort([mockTechnicians[0]], 'name');
      
      expect(result.length).toBe(1);
      expect(result[0].id_user).toBe(mockTechnicians[0].id_user);
    });

    it('should handle invalid sort type', () => {
      const result = service.sort([...mockTechnicians], 'rating' as SortType);
      
      // Con 'rating' sin implementar, debería retornar sin cambios
      expect(result.length).toBe(mockTechnicians.length);
    });
  });
});
