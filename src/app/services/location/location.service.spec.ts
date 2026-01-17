import { TestBed } from '@angular/core/testing';
import { LocationService, Coordinates } from './location.service';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationService]
    });
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Madrid: 40.4168, -3.7038
      // Barcelona: 41.3851, 2.1734
      const madrid: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      const barcelona: Coordinates = { latitude: 41.3851, longitude: 2.1734 };

      const distance = service.calculateDistance(madrid, barcelona);

      // La distancia real es aproximadamente 504 km
      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(510);
    });

    it('should return 0 for same coordinates', () => {
      const point: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      
      const distance = service.calculateDistance(point, point);
      
      expect(distance).toBe(0);
    });

    it('should calculate short distances correctly', () => {
      // Dos puntos muy cercanos en Madrid
      const point1: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      const point2: Coordinates = { latitude: 40.4178, longitude: -3.7048 };

      const distance = service.calculateDistance(point1, point2);

      // Distancia de ~130 metros (0.1 km)
      expect(distance).toBeGreaterThanOrEqual(0.1);
      expect(distance).toBeLessThan(0.2);
    });

    it('should handle negative coordinates', () => {
      const sydney: Coordinates = { latitude: -33.8688, longitude: 151.2093 };
      const melbourne: Coordinates = { latitude: -37.8136, longitude: 144.9631 };

      const distance = service.calculateDistance(sydney, melbourne);

      // Distancia aproximada 713 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(720);
    });
  });

  describe('isValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      const valid: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      
      expect(service.isValidCoordinates(valid)).toBe(true);
    });

    it('should return false for null', () => {
      expect(service.isValidCoordinates(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(service.isValidCoordinates(undefined)).toBe(false);
    });

    it('should return false for invalid latitude (> 90)', () => {
      const invalid: Coordinates = { latitude: 100, longitude: 0 };
      
      expect(service.isValidCoordinates(invalid)).toBe(false);
    });

    it('should return false for invalid latitude (< -90)', () => {
      const invalid: Coordinates = { latitude: -100, longitude: 0 };
      
      expect(service.isValidCoordinates(invalid)).toBe(false);
    });

    it('should return false for invalid longitude (> 180)', () => {
      const invalid: Coordinates = { latitude: 0, longitude: 200 };
      
      expect(service.isValidCoordinates(invalid)).toBe(false);
    });

    it('should return false for invalid longitude (< -180)', () => {
      const invalid: Coordinates = { latitude: 0, longitude: -200 };
      
      expect(service.isValidCoordinates(invalid)).toBe(false);
    });

    it('should handle edge cases (90, 180)', () => {
      const edge1: Coordinates = { latitude: 90, longitude: 180 };
      const edge2: Coordinates = { latitude: -90, longitude: -180 };
      
      expect(service.isValidCoordinates(edge1)).toBe(true);
      expect(service.isValidCoordinates(edge2)).toBe(true);
    });
  });

  describe('formatDistance', () => {
    it('should format distances < 1km in meters', () => {
      expect(service.formatDistance(0.5)).toBe('500 m');
      expect(service.formatDistance(0.123)).toBe('123 m');
      expect(service.formatDistance(0.999)).toBe('999 m');
    });

    it('should format distances >= 1km with one decimal', () => {
      expect(service.formatDistance(1)).toBe('1.0 km');
      expect(service.formatDistance(5.234)).toBe('5.2 km');
      expect(service.formatDistance(15.678)).toBe('15.7 km');
      expect(service.formatDistance(100.5)).toBe('100.5 km');
    });

    it('should handle very small distances', () => {
      expect(service.formatDistance(0.001)).toBe('1 m');
      expect(service.formatDistance(0.0005)).toBe('1 m'); // Redondeo
    });

    it('should handle large distances', () => {
      expect(service.formatDistance(504.3)).toBe('504.3 km');
      expect(service.formatDistance(1000)).toBe('1000.0 km');
    });
  });

  describe('getCurrentPosition', () => {
    it('should return null if geolocation is not supported', async () => {
      // Mock navigator.geolocation as undefined
      const originalGeolocation = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        configurable: true
      });

      const result = await service.getCurrentPosition();

      expect(result).toBeNull();

      // Restore
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true
      });
    });

    // Note: Testing actual geolocation requires browser APIs
    // These would be integration tests rather than unit tests
  });

  describe('geocodeAddress', () => {
    it('should geocode address using Nominatim', async () => {
      // Mock fetch response
      const mockResponse = [{
        lat: '40.4168',
        lon: '-3.7038',
        display_name: 'Madrid, España'
      }];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await service.geocodeAddress('Madrid, España');

      expect(result).toEqual({
        latitude: 40.4168,
        longitude: -3.7038
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/search'),
        expect.any(Object)
      );
    });

    it('should return null if no results found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      } as Response);

      const result = await service.geocodeAddress('Dirección Inexistente XYZ123');

      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.geocodeAddress('Madrid');

      expect(result).toBeNull();
    });

    it('should include country code if provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{
          lat: '-34.6037',
          lon: '-58.3816'
        }]
      } as Response);

      await service.geocodeAddress('Buenos Aires', 'AR');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Buenos%20Aires%2C%20AR'),
        expect.any(Object)
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates', async () => {
      const mockResponse = {
        display_name: 'Puerta del Sol, Madrid, España'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const coords: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      const result = await service.reverseGeocode(coords);

      expect(result).toBe('Puerta del Sol, Madrid, España');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/reverse'),
        expect.any(Object)
      );
    });

    it('should return null on error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const coords: Coordinates = { latitude: 40.4168, longitude: -3.7038 };
      const result = await service.reverseGeocode(coords);

      expect(result).toBeNull();
    });
  });
});
