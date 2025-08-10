import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie.service';

describe('CookieService', () => {
  let service: CookieService;
  let localStorageMock: any;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };

    // Asignar el mock al objeto global
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [CookieService]
    });

    service = TestBed.inject(CookieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isFirstVisit', () => {
    it('should return true when no consent exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = service.isFirstVisit();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');
    });

    it('should return false when consent exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('accepted');

      const result = service.isFirstVisit();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');
    });

    it('should return false when consent is rejected', () => {
      localStorageMock.getItem.mockReturnValue('rejected');

      const result = service.isFirstVisit();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');
    });

    it('should return false when consent value is empty string', () => {
      localStorageMock.getItem.mockReturnValue('');

      const result = service.isFirstVisit();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');
    });
  });

  describe('setCookieConsent', () => {
    it('should set consent and date in localStorage', () => {
      const mockDate = '2025-08-10T11:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      service.setCookieConsent();

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-cookie-consent', 'accepted');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-consent-date', mockDate);
    });

    it('should handle date generation correctly', () => {
      // Verificar que se usa la fecha actual
      const beforeCall = new Date().getTime();
      
      service.setCookieConsent();
      
      const afterCall = new Date().getTime();

      // Verificar que localStorage.setItem fue llamado
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      
      // Verificar que el primer argumento del segundo call contiene una fecha válida
      const calls = localStorageMock.setItem.mock.calls;
      const dateCall = calls.find((call: any[]) => call[0] === 'tecaway-consent-date');
      expect(dateCall).toBeDefined();
      
      if (dateCall) {
        const storedDate = new Date(dateCall[1]).getTime();
        expect(storedDate).toBeGreaterThanOrEqual(beforeCall);
        expect(storedDate).toBeLessThanOrEqual(afterCall);
      }
    });

    it('should override existing consent', () => {
      // Simular que ya existe un consentimiento
      localStorageMock.getItem.mockReturnValue('old-value');

      service.setCookieConsent();

      // Debe establecer los nuevos valores
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-cookie-consent', 'accepted');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-consent-date', expect.any(String));
    });
  });

  describe('getCookieConsent', () => {
    it('should return hasConsent true and date when consent is accepted', () => {
      const mockDate = '2025-08-10T11:30:00.000Z';
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'accepted';
        if (key === 'tecaway-consent-date') return mockDate;
        return null;
      });

      const result = service.getCookieConsent();

      expect(result).toEqual({
        hasConsent: true,
        consentDate: mockDate
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-consent-date');
    });

    it('should return hasConsent false when consent is not accepted', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'rejected';
        if (key === 'tecaway-consent-date') return null;
        return null;
      });

      const result = service.getCookieConsent();

      expect(result).toEqual({
        hasConsent: false,
        consentDate: null
      });
    });

    it('should return hasConsent false when no consent exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = service.getCookieConsent();

      expect(result).toEqual({
        hasConsent: false,
        consentDate: null
      });
    });

    it('should return hasConsent false for any value other than accepted', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'something-else';
        if (key === 'tecaway-consent-date') return '2025-08-10T11:30:00.000Z';
        return null;
      });

      const result = service.getCookieConsent();

      expect(result).toEqual({
        hasConsent: false,
        consentDate: '2025-08-10T11:30:00.000Z'
      });
    });

    it('should handle missing date gracefully', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'accepted';
        if (key === 'tecaway-consent-date') return null;
        return null;
      });

      const result = service.getCookieConsent();

      expect(result).toEqual({
        hasConsent: true,
        consentDate: null
      });
    });
  });

  describe('clearCookieConsent', () => {
    it('should remove both consent and date from localStorage', () => {
      service.clearCookieConsent();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-consent-date');
    });

    it('should work even when localStorage is empty', () => {
      // localStorage ya está vacío por defecto
      expect(() => service.clearCookieConsent()).not.toThrow();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-consent-date');
    });

    it('should work when only partial data exists', () => {
      // Simular que solo existe una de las claves
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'accepted';
        return null;
      });

      service.clearCookieConsent();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-consent-date');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full cookie consent flow', () => {
      // 1. Primera visita
      expect(service.isFirstVisit()).toBe(true);

      // 2. Establecer consentimiento
      const mockDate = '2025-08-10T11:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
      
      service.setCookieConsent();

      // 3. Verificar que localStorage fue actualizado
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-cookie-consent', 'accepted');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-consent-date', mockDate);

      // 4. Simular que ahora localStorage tiene los valores
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'accepted';
        if (key === 'tecaway-consent-date') return mockDate;
        return null;
      });

      // 5. Verificar que ya no es primera visita
      expect(service.isFirstVisit()).toBe(false);

      // 6. Obtener consentimiento
      const consent = service.getCookieConsent();
      expect(consent.hasConsent).toBe(true);
      expect(consent.consentDate).toBe(mockDate);

      // 7. Limpiar consentimiento
      service.clearCookieConsent();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-consent-date');
    });

    it('should handle consent rejection flow', () => {
      // Simular rechazo manual (no hay método específico, pero podemos simular el estado)
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'rejected';
        return null;
      });

      expect(service.isFirstVisit()).toBe(false);
      
      const consent = service.getCookieConsent();
      expect(consent.hasConsent).toBe(false);
      expect(consent.consentDate).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage errors gracefully', () => {
      // Simular error en localStorage
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('LocalStorage unavailable');
      });

      expect(() => service.isFirstVisit()).toThrow('LocalStorage unavailable');
    });

    it('should handle invalid date formats', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'tecaway-cookie-consent') return 'accepted';
        if (key === 'tecaway-consent-date') return 'invalid-date';
        return null;
      });

      const result = service.getCookieConsent();
      
      expect(result.hasConsent).toBe(true);
      expect(result.consentDate).toBe('invalid-date'); // El servicio devuelve lo que hay
    });

    it('should validate private constants are being used', () => {
      // Verificar que las constantes privadas se usan correctamente
      service.isFirstVisit();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tecaway-cookie-consent');

      service.setCookieConsent();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-cookie-consent', 'accepted');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tecaway-consent-date', expect.any(String));

      service.clearCookieConsent();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-cookie-consent');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecaway-consent-date');
    });
  });
});
