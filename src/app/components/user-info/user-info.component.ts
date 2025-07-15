import { Component, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authService/auth.service';
import { CloudinaryTransformPipe } from '../../pipes/cloudinary-transform.pipe';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, RouterLink, CloudinaryTransformPipe],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  technician: any = {};
  userService = inject(UserService);
  authService = inject(AuthService);
  id: number = 0;
  showDeleteModal: boolean = false;

  constructor(
    private aRouter: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe((res: any) => {
      this.id = res.data.id_user;
      console.log('ID USER', res.data);
      this.technician = this.userService.getUserInfo(this.id).subscribe((res: any) => {
        this.technician = res.data;
      });
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  deleteAccount() {
    this.userService.deleteUser(this.id).subscribe({
      next: () => {
        this.authService.logoutUser();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        // Aquí podrías añadir un mensaje de error para el usuario
      }
    });
  }
}