import { Component, inject, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { validateFile } from '../../validators/validate-file.validator';


@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent implements OnInit {  // Cambiamos a OnInit
  errorMessage: string = '';
  charCountTitle: number = 0;
  charCountDescription: number = 0;
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

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.userService.getUser()
      .subscribe({
        next: (response: any) => {
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
    if (titleControl) {
      name === 'title' ? this.charCountTitle = titleControl.value?.length || 0 :
        this.charCountDescription = titleControl.value?.length || 0;
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
    this.userService.uploadPhoto(photo).subscribe({
      next: () => {
        this.finishUpdate(this.registerForm.get('inputName')?.value!);
      },
      error: (error) => {
        console.error('Error al subir la foto:', error);
        this.toastr.warning('Los datos se actualizaron pero hubo un error al subir la foto', 'Advertencia');
      }
    });
  }

  private finishUpdate(userName: string): void {
    this.toastr.success(`${userName} Actualización exitosa`, 'El usuario se ha actualizado con éxito!');
    this.router.navigate(['/tu-cuenta']);
  }

 
}
