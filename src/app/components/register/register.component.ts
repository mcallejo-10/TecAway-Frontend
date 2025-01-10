import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  errorMessage: string = '';
  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('',
      [Validators.required,
        Validators.minLength(4),
        Validators.pattern('^(?=.*[A-Z]).{4,}$')
      ]),    
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(130)
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(30),
        Validators.maxLength(2400)
      ]),
      town: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      can_move: new FormControl(false),

      photo: new FormControl(''),

  });

  private authService = inject(AuthService)
  constructor(private fb: FormBuilder,private auth: AuthService,
    private router: Router
  ) {}
 
  onRegister(): void {
    if (this.registerForm.valid) {
      // this.isLoading = true;
      this.errorMessage = '';


      const userData: User = {
        name: this.registerForm.get('name')?.value || '',
        email: this.registerForm.get('email')?.value?.toLowerCase() || '',
        password: this.registerForm.get('password')?.value || '',
        title: this.registerForm.get('title')?.value || '',
        description: this.registerForm.get('description')?.value || '',
        town: this.registerForm.get('town')?.value || '',
        can_move: this.registerForm.get('can_move')?.value || false,
        photo: this.registerForm.get('photo')?.value || '',
        roles: 'user'
      };

      this.authService.checkEmailExists(userData.email!)
        .subscribe({
          next: (users: User[]) => {
            if (users.length > 0) {
            console.log('en next regis', users);
            
            this.errorMessage = 'This email is already registered';
            // this.isLoading = false;
          } else {
              console.log('en else regis', users);
              this.authService.registerUser(userData)
                .subscribe({
                  next: (response: User) => {
                    console.log('Usuario registrado:', response);
                    // this.isLoading = false;                    
                    this.router.navigate(['/login']);
                  },
                  error: (error:string) => {
                    console.error('Error al registrar:', error);
                    this.errorMessage = 'Error al registrar usuario';
                    // this.isLoading = false;
                  }
                });
            }
          },
          error: (error: string) => {
            console.error('Error al verificar email:', error);
            this.errorMessage = 'Error al verificar email';
            // this.isLoading = false;
          }
        });
    }
  }

}
