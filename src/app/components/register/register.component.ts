import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
  });

  private authService = inject(AuthService)
  constructor(private fb: FormBuilder,private auth: AuthService,
    private router: Router
  ) {}
 


}
