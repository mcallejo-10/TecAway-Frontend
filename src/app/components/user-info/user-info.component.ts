import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authService/auth.service';
import { UserAvatarComponent } from '../utils/user-avatar/user-avatar.component';
import { LoadingBarComponent } from '../utils/loading-bar/loading-bar.component';
import { UserResponse } from '../../interfaces/user';
import { UserInfoResponse } from '../../interfaces/user-info';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, RouterLink, UserAvatarComponent, LoadingBarComponent],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit {
  loading = true;
  technician: UserInfoResponse['data'] = {} as UserInfoResponse['data'];
  userService = inject(UserService);
  authService = inject(AuthService);
  private aRouter = inject(ActivatedRoute);
  private router = inject(Router);
  id = 0;
  showDeleteModal = false;

  ngOnInit() {
    this.loading = true;
    this.userService.getUser().subscribe((res: UserResponse) => {
      this.id = res.data.id_user!;
      console.log('ID USER', res.data);
      this.userService.getUserInfo(this.id).subscribe((res: UserInfoResponse) => {
        this.technician = res.data;
        this.loading = false;
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
      }
    });
  }
}