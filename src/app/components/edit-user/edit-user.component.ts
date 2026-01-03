/* eslint-disable */ 

import { Component, inject, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { validateFile } from '../../validators/validate-file.validator';
import { UserResponse } from '../../interfaces/user';


@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent implements OnInit {  // Cambiamos a OnInit
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
    town: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    photo: new FormControl('', validateFile),
    can_move: new FormControl(false),
  });


  private userService = inject(UserService)
  private router = inject(Router)
  private toastr = inject(ToastrService)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.userService.getUser()
      .subscribe({
        next: (response: UserResponse) => {
          Promise.resolve().then(() => {  // Envolver en una Promise
            this.registerForm.patchValue({
              name: response.data.name,
              email: response.data.email,
              title: response.data.title,
              description: response.data.description,
              town: response.data.town,
              can_move: response.data.can_move,
            });

            this.updateCharCount('title');
            this.updateCharCount('description');
            this.cdr.markForCheck();  // Usar markForCheck en lugar de detectChanges
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
      console.log('=== ARCHIVO SELECCIONADO ===');
      console.log('Nombre original:', file.name);
      console.log('Tipo MIME:', file.type);
      console.log('Tamaño:', file.size, 'bytes');
      console.log('Última modificación:', new Date(file.lastModified));
      console.log('===============================');
      
      // Manejo especial para archivos HEIC/HEIF
      if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        console.log('🍎 Archivo HEIC detectado (formato iOS)');
      }
      
      // Detectar si es una conversión automática de Safari
      if (file.type === 'image/heic' && !file.name.toLowerCase().includes('.heic')) {
        console.log('⚠️ Safari convirtió automáticamente a HEIC');
      }
      
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
        town: (this.registerForm.get('town')?.value || '').trim(),
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
    console.log('Iniciando subida de foto:', {
      name: photo.name,
      type: photo.type,
      size: photo.size
    });
    
    this.userService.uploadPhoto(photo).subscribe({
      next: () => {
        console.log('Foto subida exitosamente');
        this.finishUpdate(this.registerForm.get('inputName')?.value!);
      },
      error: (error) => {
        console.error('Error detallado al subir la foto:', error);
        
        // Mensajes específicos según el tipo de error
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
