import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/userService/user.service';

@Component({
  selector: 'app-technicians',
  imports: [RouterLink],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  technicians: any = [];

  userService = inject(UserService);

  ngOnInit() {
    this.userService.getUserList().subscribe(data => {
      this.technicians = data;
      console.log(this.technicians);
      
    });
  }

}
