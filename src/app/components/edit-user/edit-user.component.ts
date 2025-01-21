import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { MustMatch } from '../../validators/must-match.validator';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {
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

  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.userService.getUser()
      .subscribe({
        next: (response: User) => {
          console.log('----Usuario:', response);
          
          this.registerForm.patchValue({
            name: response.name,
            email: response.email,
            title: response.title,
            description: response.description,
            town: response.town,
            can_move: response.can_move,
            photo: response.photo
          });
        },
        error: (error: string) => {
          console.error('Error al obtener usuario:', error);
          this.errorMessage = 'Error al obtener usuario';
          this.toastr.error('Error al obtener usuario', 'Error');
        }
      });
  }
  updateUser(): void {

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
        roles: ['user']  //
      };
      console.log('userData:', userData);
      

      this.userService.updateUser(userData)
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
