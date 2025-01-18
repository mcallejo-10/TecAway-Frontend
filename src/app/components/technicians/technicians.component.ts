import { Component, HostListener, inject } from '@angular/core';

import { UserService } from '../../services/userService/user.service';
import { User } from '../../interfaces/user';
import { FilterService } from '../../services/filterService/filter.service';
import { SectionService } from '../../services/sectionService/section.service';
import { Section } from '../../interfaces/section';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-technicians',
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule],
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
  selectedKnowledges: Knowledge[] = [];

  setFilteredIds: number[] = this.filterService.filterTechnicians();
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
      this.addConocimientosGenerales();

      this.filterForm.addControl('knowledges', this.fb.group(knowledgeControls));
      this.filterService.setSelectedKnowledges(this.knowledgeList);
      
      console.log("<<<<>>>>> selectedKnowledges", this.selectedKnowledges);
    });
    
  }



  isCheckedSection(id: number): boolean {
    return this.selectedSections.some((section) => section.id_section === id);
  }

  isCheckedKnowledge(id: number): boolean {
    return this.selectedKnowledges.some((knowledge) => knowledge.id_knowledge === id);
  }


  // funcion para que se agreguen automaticamente el seccion 'Conocimientos generales' 
  addConocimientosGenerales(): void {
    const section = this.sectionList.find(
      (section) => section.section === 'Conocimientos generales'
    );
    if (section) {
      this.selectedSections.push(section);                    
      const knowledeService = this.knowledgeList.filter(k => k.knowledge === section.section);     
      this.selectedKnowledges.push(knowledeService[0]);      
    }
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
        }
        const knowledeService = this.knowledgeList.filter(k => k.knowledge === section.section!);

        this.selectedKnowledges.push(knowledeService[0]);
        this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      }
      this.filterService.setSelectedSections(this.selectedSections);

    } else {
      // Quitar la sección deseleccionada
      this.selectedSections = this.selectedSections.filter(
        (section) => section.id_section !== id_section
      );
      if (this.selectedSections.length === 0) {
        this.ngOnInit();
      } else {
        this.filterService.setSelectedSections(this.selectedSections);
      }
      this.selectedKnowledges = this.selectedKnowledges.filter(
        (knowledge) => knowledge.section_id !== id_section
      );
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
    }
    this.filterService.filterTechnicians();
    this.filterTechniciansById();
  }



  getSelectedKnowledges(id_knowledge: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      const knowledge = this.knowledgeList.find(
        (knowledge) => knowledge.id_knowledge === id_knowledge
      );
      if (knowledge) {
        if (!this.selectedKnowledges.some(k => k.id_knowledge === id_knowledge)) {
          this.selectedKnowledges.push(knowledge);
        }
      }
      this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      this.filterService.filterTechnicians();
    }
    else {
      this.selectedKnowledges = this.selectedKnowledges.filter(
        (knowledge) => knowledge.id_knowledge !== id_knowledge
      );
      if (this.selectedKnowledges.length === 0) {
        this.filterService.setSelectedKnowledges(this.knowledgeList);
      } else {
        this.filterService.setSelectedKnowledges(this.selectedKnowledges);
      }

      this.filterService.filterTechnicians();
    }
    this.filterTechniciansById()
  }


  filterTechniciansById(): void {
    const filtredIds = this.filterService.filterTechnicians();

    const filteredTechnicians = this.technicians.filter(
      (technician) => technician.id_user && filtredIds.includes(technician.id_user)
    );
    this.filterService.techniciansFiltred.set(filteredTechnicians);
    this.filterService.filterTechnicians();
    this.filterService.techniciansFiltred();
  }
  toggleFilter() {
    const filterCard = document.querySelector('.filter-card');
    const overlay = document.querySelector('.filter-overlay');
    
    if (filterCard && overlay) {
      filterCard.classList.toggle('show');
      overlay.classList.toggle('show');
      document.body.style.overflow = filterCard.classList.contains('show') ? 'hidden' : '';
    }
  }

  closeFilter() {
    const filterCard = document.querySelector('.filter-card');
    const overlay = document.querySelector('.filter-overlay');
    
    if (filterCard && overlay) {
      filterCard.classList.remove('show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // Opcional: cierra el filtro cuando cambia el tamaño de la ventana a desktop
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 768) {
      this.closeFilter();
    }
  }
}