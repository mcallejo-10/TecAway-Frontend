import { Component, inject } from '@angular/core';

import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';

@Component({
  selector: 'app-technicians',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './technicians.component.html',
  styleUrl: './technicians.component.scss'
})
export class TechniciansComponent {

  technicians: User[] = [];

  filterForm!: FormGroup;
  formBuilder = inject(FormBuilder);

  userService = inject(UserService);
  filterService = inject(FilterService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);

  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];
  selectedSections: Section[] = [];
  setectedKnowledges: Knowledge[] = [];

  setFilteredIds: Number[] = this.filterService.setFilteredIds();
  filteredTechnicians: User[] = [];

  constructor(private fb: FormBuilder) { }
  ngOnInit() {
    this.filterForm = this.fb.group({});
    this.userService.getUserList().subscribe((res: any) => {
      this.technicians = res.data;
      this.filteredTechnicians = this.technicians;
      this.filterService.setTechnicianList(this.technicians);
    });

    this.sectionService.getSectionList().subscribe((res: any) => {
      this.sectionService.setSectionList(res.data);

      this.sectionList = this.sectionService.sectionList();

      const sectionControls = this.sectionList.reduce((acc, section) => {
        acc[section.id_section!] = new FormControl(false);
        return acc;
      }, {} as { [key: string]: FormControl });

      this.filterForm.addControl('sections', this.fb.group(sectionControls));
      this.filterService.setSelectedSections(this.sectionList);
    });

    this.knowledgeService.getKnowledgeList().subscribe((res: any) => {
      this.knowledgeList = res.data;
      const knowledgeControls = this.knowledgeList.reduce((acc, knowledge) => {
        acc[knowledge.id_knowledge!] = new FormControl(false);
        return acc;
      }, {} as { [key: string]: FormControl });

      this.filterForm.addControl('knowledges', this.fb.group(knowledgeControls));
      this.filterService.setSelectedKnowledges(this.knowledgeList);
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
        if (!this.selectedSections.some(s => s.id_section === id_section)) {
          this.selectedSections.push(section);
          // console.log('Selected Sections:', this.selectedSections);          
        }
      }
      this.filterService.setSelectedSections(this.selectedSections);
    } else {
      // Quitar la sección deseleccionada
      this.selectedSections = this.selectedSections.filter(
        (section) => section.id_section !== id_section
      );
      if (this.selectedSections.length === 0) {
      this.filterService.setSelectedSections(this.sectionList);
      }else{
      this.filterService.setSelectedSections(this.selectedSections);
      }
      this.setectedKnowledges = this.setectedKnowledges.filter(
        (knowledge) => knowledge.section_id !== id_section
      );
    }
    // this.filterService.setSelectedSections(this.selectedSections);
    this.filterService.setFilteredIds();
    this.filterTechniciansById();
  }



  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // Agregar la sección seleccionada
      const knowledge = this.knowledgeList.find(
        (knowledge) => knowledge.id_knowledge === id_knowledge
      );
      // const isSelected = this.setectedKnowledges.some(id_knowledge => knowledge.id_knowledge === id_knowledge);
      if (knowledge) {
        this.setectedKnowledges.push(knowledge);
      }
    } else {
      this.setectedKnowledges = this.setectedKnowledges.filter(
        (knowledge) => knowledge.id_knowledge !== id_knowledge
      );

    }
    console.log('Selected Knowledges:', this.setectedKnowledges);
  }

  filterTechniciansById(): void {
    const filtredIds = this.filterService.setFilteredIds();
console.log('Filtred Ids:', filtredIds);

    const filteredTechnicians = this.technicians.filter(
      (technician) => technician.id_user && filtredIds.includes(technician.id_user)  
    );
    this.filterService.techniciansFiltred.set(filteredTechnicians);
    this.filterService.setFilteredIds();
    this.filterService.techniciansFiltred();
    console.log('Filtred Technicians:', filteredTechnicians);
    console.log('SIGNAL Filtred Technicians:', this.filterService.techniciansFiltred());
    
  }

}