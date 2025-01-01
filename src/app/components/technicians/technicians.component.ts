import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';

@Component({
  selector: 'app-technicians',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  technicians: User[] = [];
  filtredTechnicians: User[] = [];

  filterForm!: FormGroup;

  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);

  sectionList: any[] = [];
  knowledgeList: any[] = [];
  formBuilder = inject(FormBuilder);
  selectedSections: any[] = [];
  setectedKnowledges: any[] = [];


  constructor(private fb: FormBuilder) { }
  ngOnInit() {
    this.filterForm = this.fb.group({});
    this.userService.getUserList().subscribe((res: any) => {
      this.technicians = res.data;
      console.log("tecnics", this.technicians);
      this.filterService.setTechnicianList(this.technicians);      
    });
    
    
    this.sectionService.getSectionList().subscribe((res: any) => {
      this.sectionService.setSectionList(res.data);
      console.log("sectionList signal", this.sectionList);
      this.sectionList = this.sectionService.sectionList();

      const sectionControls = this.sectionList.reduce((acc, section) => {
        acc[section.id_section] = new FormControl(false);
        return acc;
      }, {} as { [key: string]: FormControl });

      this.filterForm.addControl('sections', this.fb.group(sectionControls));
    });

    this.knowledgeService.getKnowledgeList().subscribe((res: any) => {
      this.knowledgeList = res.data;
      console.log("knowledgeList signal", this.knowledgeList);
      

      const knowledgeControls = this.knowledgeList.reduce((acc, knowledge) => {
        acc[knowledge.id_knowledge] = new FormControl(false);
        return acc;
      }, {} as { [key: string]: FormControl });

      this.filterForm.addControl('knowledges', this.fb.group(knowledgeControls));
    });
  }

  isCheckedSection(id: number): boolean {
  
    return this.selectedSections.some((section) => section.id_section === id);
  }

  isCheckedKnowledge(id: number): boolean {
    return this.setectedKnowledges.some((knowledge) => knowledge.id_knowledge === id);
  }



  getSelectedSections(id_section: number, event: Event): void {


    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // Agregar la sección seleccionada
      const section = this.sectionList.find(
        (section) => section.id_section === id_section
      );
      if (section) {
        this.selectedSections.push(section);
      }
    } else {
      // Quitar la sección deseleccionada
      this.selectedSections = this.selectedSections.filter(
        (section) => section.id_section !== id_section
      );

    }
    console.log('Selected Sections:', this.selectedSections);

  }


  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // Agregar la sección seleccionada
      const knowledge = this.knowledgeList.find(
        (knowledge) => knowledge.id_knowledge === id_knowledge
      );
      const isSelected = this.setectedKnowledges.some( id_knowledge => knowledge.id_knowledge === id_knowledge);
      if (knowledge && !isSelected) {
        this.setectedKnowledges.push(knowledge);
      }
    } else {
      // Quitar la sección deseleccionada
      this.setectedKnowledges = this.setectedKnowledges.filter(
        (knowledge) => knowledge.id_knowledge !== id_knowledge
      );

    }
    console.log('Selected Knowledges:', this.setectedKnowledges);
  }


}