import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieBannerComponent } from './cookie-banner.component';
import { CookieService } from '../../services/cookieService/cookie.service';
import { provideRouter } from '@angular/router';

describe('CookieBannerComponent', () => {
  let component: CookieBannerComponent;
  let fixture: ComponentFixture<CookieBannerComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cookieServiceMock: any;

  beforeEach(async () => {
    cookieServiceMock = {
      isFirstVisit: jest.fn(),        
      setCookieConsent: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CookieBannerComponent],
      providers: [
        provideRouter([]),  
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CookieBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should show banner on first visit', () => {
      // Simular que SÍ es primera visita
      cookieServiceMock.isFirstVisit.mockReturnValue(true);

      // Espiar console.log para verificar el mensaje
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      fixture.detectChanges();  // Ejecuta ngOnInit

      // Verificaciones
      expect(cookieServiceMock.isFirstVisit).toHaveBeenCalled();
      expect(component.isVisible).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '👋 Welcome, young Padawan! Cookie banner activated'
      );

      consoleLogSpy.mockRestore();
    });

    it('should not show banner if not first visit', () => {
      // Simular que NO es primera visita (usuario ya aceptó cookies antes)
      cookieServiceMock.isFirstVisit.mockReturnValue(false);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      fixture.detectChanges();

      expect(component.isVisible).toBe(false);
      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });


  describe('acceptCookies', () => {
    beforeEach(() => {
      // IMPORTANTE: Usar Jest fake timers para controlar setTimeout
      jest.useFakeTimers();
      
      const mockElement = document.createElement('div');
      mockElement.classList.add('cookie-banner');
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should call setCookieConsent when accepting cookies', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      component.acceptCookies();

      expect(cookieServiceMock.setCookieConsent).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ User accepted cookies - May the Force be with you'
      );
      consoleLogSpy.mockRestore();
    });

    it('should hide banner after accepting cookies', () => {
      component.isVisible = true;

      component.acceptCookies();

      const banner = document.querySelector('.cookie-banner');
      expect(banner?.classList.contains('fade-out')).toBe(true);

      jest.advanceTimersByTime(300);

      expect(component.isVisible).toBe(false);
    });
  });

  describe('hideBanner behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should handle case when banner element exists in DOM', () => {
      const mockElement = document.createElement('div');
      mockElement.classList.add('cookie-banner');
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      component.isVisible = true;
      component.acceptCookies();

      expect(mockElement.classList.contains('fade-out')).toBe(true);

      jest.advanceTimersByTime(300);
      expect(component.isVisible).toBe(false);
    });

    it('should handle case when banner element does not exist in DOM', () => {
      // Caso edge: el banner no existe en el DOM (puede pasar en tests)
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      component.isVisible = true;
      component.acceptCookies();

      // Debería ocultar inmediatamente sin setTimeout
      expect(component.isVisible).toBe(false);
      
      // No debe haber setTimeout pendiente
      jest.advanceTimersByTime(300);
      // Ya está en false, no cambia
      expect(component.isVisible).toBe(false);
    });

    it('should set isVisible to false after animation completes', () => {
      const mockElement = document.createElement('div');
      mockElement.classList.add('cookie-banner');
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      component.isVisible = true;
      component.acceptCookies();

      expect(component.isVisible).toBe(true);

      jest.advanceTimersByTime(150);
      expect(component.isVisible).toBe(true);

      jest.advanceTimersByTime(150);
      expect(component.isVisible).toBe(false);
    });
  });
});
