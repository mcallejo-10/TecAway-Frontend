/* eslint-disable */ 

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { MustMatch } from '../../validators/must-match.validator';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { validateFile } from '../../validators/validate-file.validator';
import { LocationSearchComponent, LocationData } from '../utils/location-search/location-search.component';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, LocationSearchComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  currentStep = 1;
  errorMessage = '';
  charCountTitle = 0;
  charCountDescription = 0;
  selectedFile: File | null = null;

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
    city: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    latitude: new FormControl<number | null>(null, [Validators.required]),
    longitude: new FormControl<number | null>(null, [Validators.required]),
    country: new FormControl('', [
      Validators.required
    ]),
    can_move: new FormControl(false),
    photo: new FormControl('', validateFile()),
    acceptPrivacyPolicy: new FormControl(false, [Validators.requiredTrue]),
    },
    {
      validators: MustMatch('password', 'confirmPassword')
    });

  private authService = inject(AuthService)
  private userService = inject(UserService)
  private router = inject(Router)
  private toastr = inject(ToastrService)
  private cdr = inject(ChangeDetectorRef)

  validateFirstStep(): boolean {
    const controls = ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'];
    return controls.every(control =>
      this.registerForm.get(control)?.valid &&
      this.registerForm.get(control)?.touched
    );
  }

  onLocationSelected(location: LocationData): void {
    this.registerForm.patchValue({
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    });
    ['city', 'country', 'latitude', 'longitude'].forEach(field => {
      this.registerForm.get(field)?.markAsDirty();
      this.registerForm.get(field)?.markAsTouched();
      this.registerForm.get(field)?.updateValueAndValidity();
    });
    this.registerForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  nextStep(): void {
    const controls = ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'];
    controls.forEach(control => {
      this.registerForm.get(control)?.markAsTouched();
    });

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
            this.cdr.detectChanges(); 
          },
          error: (error) => {
            console.error('Error al verificar email:', error);
            this.errorMessage = 'Error al verificar email';
            this.cdr.detectChanges(); 
          }
        });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos requeridos y acepta la política de privacidad';
      this.cdr.detectChanges();
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    this.errorMessage = '';
  }
  

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.registerForm.get('photo')?.updateValueAndValidity();
    }
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
        city: (this.registerForm.get('city')?.value || '').trim(),
        country: (this.registerForm.get('country')?.value || '').trim(),
        latitude: this.registerForm.get('latitude')?.value ?? 0,
        longitude: this.registerForm.get('longitude')?.value ?? 0,
        can_move: this.registerForm.get('can_move')?.value || false,
        roles: ['user']
      };

      this.authService.registerUser(userData)
        .subscribe({
          next: () => {
            if (this.selectedFile) {
              this.uploadUserPhoto(this.selectedFile);
            } else {
              this.finishRegistration(userData.name);
            }
          },
          error: (error: any) => {
            console.error('Error al registrar:', error);
            this.errorMessage = 'Error al registrar usuario';
            this.toastr.error('Error al registrar usuario', 'Error');
          }
        });
    }
  }

  
  private uploadUserPhoto(photo: File): void {
    this.userService.uploadPhoto(photo).subscribe({
      next: () => {
        this.finishRegistration(this.registerForm.get('name')?.value!);
      },
      error: (error) => {
        let errorMessage = 'El usuario se creó pero hubo un error al subir la foto';
        
        if (error.status === 413) {
          errorMessage = 'El archivo es demasiado grande. El usuario se creó correctamente.';
        } else if (error.status === 415) {
          errorMessage = 'Formato de archivo no soportado. El usuario se creó correctamente.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión al subir la foto. El usuario se creó correctamente.';
        }
        
        this.toastr.warning(errorMessage, 'Advertencia');
        this.router.navigate(['/agregar-conocimientos']);
      }
    });
  }

  private finishRegistration(userName: string): void {
    this.toastr.success(`${userName} Registro exitoso`, 'El usuario se ha registrado con éxito!');
    this.router.navigate(['/agregar-conocimientos']);
  }
  updateCharCount(name: string): void {
    const titleControl = this.registerForm.get(name);

    if (titleControl) {
      name === 'title' ? this.charCountTitle = titleControl.value?.length || 0 :
        this.charCountDescription = titleControl.value?.length || 0;
    }
  }

}
