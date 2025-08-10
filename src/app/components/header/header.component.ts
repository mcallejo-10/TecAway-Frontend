import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService)
  isLogged = false;

  constructor(
    private router: Router,
  ) { }

  isDarkMode: boolean = localStorage.getItem('theme') === 'dark';

  ngOnInit() {
    // Apply saved theme on component initialization
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }
  logout() {
    console.log('Logout');

    this.authService.logoutUser().subscribe({
      next: () => {
        console.log('Logout exitoso');
        // Navegar al login después del logout
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
        // Aún así, podemos forzar la navegación al login
        this.router.navigate(['/']);
      }
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

