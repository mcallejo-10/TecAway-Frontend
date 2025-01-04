import { Component, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/userService/user.service';

@Component({
  selector: 'app-technician-detail',
  imports: [],
  templateUrl: './technician-detail.component.html',
  styleUrl: './technician-detail.component.scss'
})
export class TechnicianDetailComponent {

  technician: any = {};
userService = inject(UserService);

  constructor() { 
    this.technician = this.userService.getUserById(this.technician.id_user);
  }

}
