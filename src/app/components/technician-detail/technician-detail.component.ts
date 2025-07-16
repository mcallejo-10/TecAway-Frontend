import { Component, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../utils/user-avatar/user-avatar.component';

@Component({
  selector: 'app-technician-detail',
  imports: [CommonModule, RouterLink, UserAvatarComponent],
  templateUrl: './technician-detail.component.html',
  styleUrl: './technician-detail.component.scss'
})
export class TechnicianDetailComponent {


  technician: any = {};
  userService = inject(UserService);
  id: number;

  constructor(private aRouter: ActivatedRoute) {
    this.id = Number(aRouter.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    this.technician = this.userService.getUserInfo(this.id).subscribe((res: any) => {
      this.technician = res.data;
      console.log(this.technician);
      
    });
  };
}
