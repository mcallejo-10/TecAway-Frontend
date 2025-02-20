import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService)
  isLogged: boolean = false;

    constructor(
      private router: Router,       
    ) {}
    
  ngOnInit() {

   // this.authService.checkAuthStatus().subscribe();
  };

  
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

  // logout() {
  //   this.authService.logoutUser().subscribe(() => {

  //     console.log('Logout exitoso', this.authService.isLogged())

  //   });
  // }
}

