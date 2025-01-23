import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { MustMatch } from '../../validators/must-match.validator';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  currentStep: number = 1;
  errorMessage: string = '';
  charCountTitle: number = 0;
  charCountDescription: number = 0;

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑ ]*$')
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
    confirmPassword: new FormControl('',
      [Validators.required,
      Validators.minLength(4),
      Validators.pattern('^(?=.*[A-Z]).{4,}$'),
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

  },
    {
      validators: MustMatch('password', 'confirmPassword')
    });

  private authService = inject(AuthService)
  private userService = inject(UserService)

  constructor(
    private router: Router,
    private toastr: ToastrService,

  ) { }
  validateFirstStep(): boolean {
    const controls = ['name', 'email', 'password', 'confirmPassword'];
    return controls.every(control =>
      this.registerForm.get(control)?.valid &&
      this.registerForm.get(control)?.touched
    );
  }

  nextStep(): void {
    if (this.validateFirstStep()) {
      const email = this.registerForm.get('email')?.value?.toLowerCase() || '';

      this.userService.checkEmailExists({ email })
        .subscribe({
          next: (exists: boolean) => {
            if (exists) {
              this.errorMessage = 'Este email ya está registrado';
            } else {
              this.currentStep = 2;
              this.errorMessage = '';
            }
          },
          error: (error) => {
            console.error('Error al verificar email:', error);
            this.errorMessage = 'Error al verificar email';
          }
        });
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    this.errorMessage = '';
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';

      const userData: User = {
        name: (this.registerForm.get('name')?.value || '').trim(),
        email: (this.registerForm.get('email')?.value || '').toLowerCase().trim(),
        password: this.registerForm.get('password')?.value || '',
        title: (this.registerForm.get('title')?.value || '').trim(),
        description: (this.registerForm.get('description')?.value || '').trim(),
        town: (this.registerForm.get('town')?.value || '').trim(),
        can_move: this.registerForm.get('can_move')?.value || false,
        photo: this.registerForm.get('photo')?.value || '',
        roles: ['user']
      };
      console.log('userData:', userData);


      this.authService.registerUser(userData)
        .subscribe({
          next: (response: User) => {
            this.toastr.success(`${userData.name} Registro exitoso`, 'El usuario se ha registrado con éxito!');

            this.router.navigate(['/agregar-conocimientos']);
          },
          error: (error: string) => {
            console.error('Error al registrar:', error);
            this.errorMessage = 'Error al registrar usuario';
            this.toastr.error('Error al registrar usuario', 'Error');
          }
        });
    }
  }
  updateCharCount(name: string): void {
    const titleControl = this.registerForm.get(name);

    if (titleControl) {
      name === 'title' ? this.charCountTitle = titleControl.value?.length || 0 :
        this.charCountDescription = titleControl.value?.length || 0;
    }
  }

}
