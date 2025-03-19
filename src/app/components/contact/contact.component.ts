
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { ToastrService } from 'ngx-toastr';
import { MessageData } from '../../interfaces/messageData';
import { User } from '../../interfaces/user';
import { ContactService } from '../../services/contactService/contact.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  errorMessage: string = '';
  id: number;
  technician: User = {} as User;


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

  private contactService = inject(ContactService)
  private userService = inject(UserService)

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private aRouter: ActivatedRoute) {
    this.id = Number(aRouter.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    
    this.userService.getUserById(this.id).subscribe({
      next: (response: any) => {
        this.technician = response.data;
      },
      error: (error: string) => {
        console.error('Error al obtener usuario:', error);
        this.errorMessage = 'Error al obtener usuario';        
      }
    });
    
  }

  sendEmail(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      const emailData: MessageData = {
        senderName: this.registerForm.get('name')?.value || '',
        senderEmail: this.registerForm.get('email')?.value || '',
        message: this.registerForm.get('message')?.value || '',
        userId: this.id
      };

      this.contactService.sendMessage(emailData).subscribe({
        next: () => {
          this.toastr.success('Email enviado correctamente');
          this.registerForm.reset();
          this.router.navigate(['/user', this.id]);
        },
        error: (error) => {
          console.error('Error al enviar el email', error);
          this.toastr.error('Error al enviar el email');
          this.errorMessage = 'Error al enviar el email';
        }
      });
    }
  }
}
