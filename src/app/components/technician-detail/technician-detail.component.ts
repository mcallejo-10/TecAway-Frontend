import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../utils/user-avatar/user-avatar.component';
import { LoadingBarComponent } from '../utils/loading-bar/loading-bar.component';
import { UserInfoResponse } from '../../interfaces/user-info';

@Component({
  selector: 'app-technician-detail',
  imports: [CommonModule, RouterLink, UserAvatarComponent, LoadingBarComponent],
  templateUrl: './technician-detail.component.html',
  styleUrl: './technician-detail.component.scss'
})
export class TechnicianDetailComponent implements OnInit {

  loading = true;
  technician: UserInfoResponse['data'] = {} as UserInfoResponse['data'];
  userService = inject(UserService);
  id: number;
 private aRouter = inject(ActivatedRoute);
  constructor() {
    this.id = Number(this.aRouter.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    this.loading = true
    this.userService.getUserInfo(this.id).subscribe((res: UserInfoResponse) => {
      this.technician = res.data;
      console.log(this.technician);
      this.loading = false
    });
  };
}
