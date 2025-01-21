import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService)
  isLogged: boolean = false;

  ngOnInit() {
    this.authService.checkAuthStatus().subscribe();

    this.isLogged = this.authService.isLogged();
  };
}


