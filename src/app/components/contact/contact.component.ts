
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { User } from '../../interfaces/user';
import { MustMatch } from '../../validators/must-match.validator';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { validateFile } from '../../validators/validate-file.validator';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

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
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(10)
    ])
  });

  private authService = inject(AuthService)
  private userService = inject(UserService)

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) { }


  sendEmail(): void {
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')?.value;
      const message = this.registerForm.get('message')?.value;
      const name = this.registerForm.get('name')?.value;
      this.authService.sendEmail(email!, message!, name!).subscribe(
        () => {
          this.toastr.success('Email enviado correctamente');
          this.registerForm.reset();
        },
        (error) => {
          this.toastr.error('Error al enviar el email');
        }
      );
    }
  }
}
