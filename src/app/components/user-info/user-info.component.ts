import { Component, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
 technician: any = {};
  userService = inject(UserService);
  id: number = 0;

  constructor(private aRouter: ActivatedRoute) {
  }
  
  ngOnInit() {
    this.userService.getUser().subscribe((res: any) => {      
      this.id = res.data.id;
    });
    
    this.technician = this.userService.getUserInfo(this.id).subscribe((res: any) => {
      this.technician = res.data;
    });
}
}