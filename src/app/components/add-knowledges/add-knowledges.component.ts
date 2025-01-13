import { Component, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { SectionService } from '../../services/sectionService/section.service';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';
import { Section } from '../../interfaces/section';

@Component({
  selector: 'app-add-knowledges',
  imports: [],
  templateUrl: './add-knowledges.component.html',
  styleUrl: './add-knowledges.component.scss'
})
export class AddKnowledgesComponent {

  userService = inject(UserService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);

    selectedKnowledges: number[] = [];
    sectionList: Section[] = [];
      knowledgeList: Knowledge[] = [];
    
    ngOnInit(): void {

      this.sectionService.getSectionList().subscribe((res: any) => {
        this.sectionService.setSectionList(res.data);
  
        this.sectionList = this.sectionService.sectionList();
      });
      this.knowledgeService.getKnowledgeList().subscribe((res: any) => {
        this.knowledgeService.setKnowledgeList(res.data);
  
        this.knowledgeList = this.knowledgeService.knowledgeList();
      });        
  
      // this.sectionList = this.sectionService.sectionList();
      // this.knowledgeList = this.knowledgeService.knowledgeList()
    console.log('Conocimientos:', this.knowledgeList);
    console.log('Secciones:', this.sectionList);
    }
    
    isSelected(knowledgeId: number): boolean {
      return this.selectedKnowledges.includes(knowledgeId);
    }
  
    toggleKnowledge(knowledgeId: number): void {
      const index = this.selectedKnowledges.indexOf(knowledgeId);
      if (index === -1) {
        this.selectedKnowledges.push(knowledgeId);
      } else {
        this.selectedKnowledges.splice(index, 1);
      }
    }
  
    saveKnowledges(): void {
      // Aquí implementas la lógica para guardar los conocimientos seleccionados
      console.log('Conocimientos seleccionados:', this.selectedKnowledges);
    }
  }


