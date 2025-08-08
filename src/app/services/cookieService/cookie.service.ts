import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  
  private readonly CONSENT_KEY = 'tecaway-cookie-consent';
  private readonly CONSENT_DATE_KEY = 'tecaway-consent-date';
  
  constructor() {
    console.log('🍪 CookieService initialized');
  }

  isFirstVisit(): boolean {
    const hasConsent = localStorage.getItem(this.CONSENT_KEY);
    return hasConsent === null;
  }

  setCookieConsent(): void {
    const now = new Date().toISOString();
    
    localStorage.setItem(this.CONSENT_KEY, 'accepted');
    localStorage.setItem(this.CONSENT_DATE_KEY, now);
    
    console.log('✅ Cookie consent accepted at:', now);
  }

  getCookieConsent(): {
    hasConsent: boolean;
    consentDate: string | null;
  } {
    const consent = localStorage.getItem(this.CONSENT_KEY);
    const date = localStorage.getItem(this.CONSENT_DATE_KEY);
    
    return {
      hasConsent: consent === 'accepted',
      consentDate: date
    };
  }

  clearCookieConsent(): void {
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem(this.CONSENT_DATE_KEY);
    console.log('🗑️ Cookie consent cleared');
  }
}
