import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieService } from '../../services/cookieService/cookie.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent implements OnInit {
  
  isVisible = false;
  private cookieService = inject(CookieService);

  ngOnInit(): void {
    this.isVisible = this.cookieService.isFirstVisit();
    
    if (this.isVisible) {
      console.log('👋 Welcome, young Padawan! Cookie banner activated');
    }
  }

  acceptCookies(): void {
    console.log('✅ User accepted cookies - May the Force be with you');
    
    this.cookieService.setCookieConsent();
    this.hideBanner();
  }

  private hideBanner(): void {
    const bannerElement = document.querySelector('.cookie-banner');
    if (bannerElement) {
      bannerElement.classList.add('fade-out');
      
      setTimeout(() => {
        this.isVisible = false;
      }, 300);
    } else {
      this.isVisible = false;
    }
  }
}
