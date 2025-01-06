import { Component, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/userService/user.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-technician-detail',
  imports: [],
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
    this.technician = this.userService.getUserById(this.id).subscribe((res: any) => {
      this.technician = res.data;
      console.log(res.data);
    });

  };



}
