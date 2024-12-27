import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-technicians',
  imports: [RouterLink],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  technicians: User[] = [];

  userService = inject(UserService);

  ngOnInit() {
    this.userService.getUserList().subscribe((res: any) => {
      this.technicians = res.data;
      console.log("tecnics", this.technicians);
      
    });
  }

}
