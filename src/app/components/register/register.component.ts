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

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  currentStep: number = 1;
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
    photo: new FormControl('', validateFile),
    acceptPrivacyPolicy: new FormControl(false, [Validators.requiredTrue]),
    },
    {
      validators: MustMatch('password', 'confirmPassword')
    });

  private authService = inject(AuthService)
  private userService = inject(UserService)

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }


  validateFirstStep(): boolean {
    const controls = ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacyPolicy'];
    return controls.every(control =>
      this.registerForm.get(control)?.valid &&
      this.registerForm.get(control)?.touched
    );
  }

  nextStep(): void {
    // Marcar todos los campos como touched para mostrar errores
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
      // Mensaje específico si no se han completado todos los campos
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

  // Modifica el método onRegister para usar selectedFile
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
        roles: ['user']
      };

      this.authService.registerUser(userData)
        .subscribe({
          next: (response: User) => {
            if (this.selectedFile) { // Usamos selectedFile en lugar de registerForm.get('photo')
              this.uploadUserPhoto(this.selectedFile);
            } else {
              this.finishRegistration(userData.name);
            }
          },
          error: (error: string) => {
            console.error('Error al registrar:', error);
            this.errorMessage = 'Error al registrar usuario';
            this.toastr.error('Error al registrar usuario', 'Error');
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
        this.finishRegistration(this.registerForm.get('name')?.value!);
      },
      error: (error) => {
        console.error('Error detallado al subir la foto:', error);
        
        // Mensajes específicos según el tipo de error
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

  // Método para finalizar el registro
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
