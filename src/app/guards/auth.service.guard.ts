// import { inject, Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/authService/auth.service';
// import { Observable, map } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard {
//     private authService = inject(AuthService);    
//   constructor(
// private router: Router
//   ) {}

//   canActivate(): Observable<boolean> {
//     return this.authService.checkAuthStatus().pipe(
//       map(response => {
//         if (response.authenticated) {
//           return true; // Autenticado, permitir acceso
//         }
//         this.router.navigate(['/login']); // Redirigir si no está autenticado
//         return false;
//       })
//     );
//   }
// }
