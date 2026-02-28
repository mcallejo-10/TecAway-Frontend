/* eslint-disable */ 
import { Component, inject, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { validateFile } from '../../validators/validate-file.validator';
import { UserResponse } from '../../interfaces/user';
import { LocationSearchComponent, LocationData } from '../utils/location-search/location-search.component';


@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LocationSearchComponent],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent implements OnInit {
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
    country: new FormControl('', [Validators.required]),
    latitude: new FormControl<number | null>(null),
    longitude: new FormControl<number | null>(null),
    photo: new FormControl('', validateFile()),
    can_move: new FormControl(false),
  });


  private userService = inject(UserService)
  private router = inject(Router)
  private toastr = inject(ToastrService)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.getUser();
  }

  onLocationSelected(location: LocationData): void {
    this.registerForm.patchValue({
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  getUser(): void {
    this.userService.getUser()
      .subscribe({
        next: (response: UserResponse) => {
          Promise.resolve().then(() => {
            this.registerForm.patchValue({
              name: response.data.name,
              email: response.data.email,
              title: response.data.title,
              description: response.data.description,
              city: response.data.city,
              country: response.data.country,
              latitude: response.data.latitude,
              longitude: response.data.longitude,
              can_move: response.data.can_move,
            });

            this.updateCharCount('title');
            this.updateCharCount('description');
            this.cdr.markForCheck();
          });
        },
        error: (error: string) => {
          console.error('Error al obtener usuario:', error);
          this.errorMessage = 'Error al obtener usuario';
          this.toastr.error('Error al obtener usuario', 'Error');
          this.cdr.markForCheck();
        }
      });
  }

updateCharCount(name: string): void {
  const titleControl = this.registerForm.get(name);
  if (!titleControl) return;

  const length = titleControl.value?.length || 0;
  if (name === 'title') {
    this.charCountTitle = length;
  } else {
    this.charCountDescription = length;
  }
}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.registerForm.get('photo')?.updateValueAndValidity();
    }
  }

  updateUser(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      const userData: any = {
        name: (this.registerForm.get('name')?.value || '').trim(),
        email: (this.registerForm.get('email')?.value || '').toLowerCase().trim(),
        title: (this.registerForm.get('title')?.value || '').trim(),
        description: (this.registerForm.get('description')?.value || '').trim(),
        city: (this.registerForm.get('city')?.value || '').trim(),
        country: (this.registerForm.get('country')?.value || '').trim(),
        ...(this.registerForm.get('latitude')?.value != null && { latitude: this.registerForm.get('latitude')?.value }),
        ...(this.registerForm.get('longitude')?.value != null && { longitude: this.registerForm.get('longitude')?.value }),
        can_move: this.registerForm.get('can_move')?.value || false,
        roles: ['user']
      };

      this.userService.updateUser(userData)
        .subscribe({
          next: () => {
            if (this.selectedFile) {
              this.uploadUserPhoto(this.selectedFile);
            } else {
              this.finishUpdate(userData.name);
            }
          },
          error: (error: string) => {
            console.error('Error al actualizar:', error);
            this.errorMessage = 'Error al actualizar usuario';
            this.toastr.error('Error al actualizar usuario', 'Error');
          }
        });
    }
  }

  private uploadUserPhoto(photo: File): void {
    this.userService.uploadPhoto(photo).subscribe({
      next: () => {
        this.finishUpdate(this.registerForm.get('name')?.value ?? '');
      },
      error: (error) => {
        let errorMessage = 'Los datos se actualizaron pero hubo un error al subir la foto';
        
        if (error.status === 413) {
          errorMessage = 'El archivo es demasiado grande. Intenta con una imagen más pequeña.';
        } else if (error.status === 415) {
          errorMessage = 'Formato de archivo no soportado. Intenta convertir la imagen a JPG.';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
        }
        
        this.toastr.warning(errorMessage, 'Advertencia');
      }
    });
  }

  private finishUpdate(userName: string): void {
    this.toastr.success(`${userName} Actualización exitosa`, 'El usuario se ha actualizado con éxito!');
    this.router.navigate(['/agregar-conocimientos']);
  }

 
}
