import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section } from '../../interfaces/section';

@Component({
  selector: 'app-technicians',
  imports: [],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  technicians: User[] = [];

  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  sectionList: Section[] = [];
  
  
  
  ngOnInit() {
    this.userService.getUserList().subscribe((res: any) => {
      this.technicians = res.data;
      console.log("tecnics", this.technicians);
      this.filterService.updateList(this.technicians);      
    });
    console.log("ahora llamamos a sectionList");
    
    this.sectionService.getSectionList().subscribe((res: any) => {
      this.sectionService.setSectionList(res.data);
      console.log("sectionList signal", this.sectionList);
      this.sectionList = this.sectionService.sectionList();

    });
  }

}
