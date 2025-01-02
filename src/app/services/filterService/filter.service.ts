import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledgeService } from '../userKowledgeService/user-knowledge.service';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() {
    this.loadUserKnowledgeList(); // Cargar los datos
  }
  techniciansFiltred = signal<User[]>([]);
  selectedSections = signal<Section[]>([]);
  selectedKnowledges = signal<Knowledge[]>([]);
  userKnowledgeList = signal<UserKnowledge[]>([]);

  userKnowledgeService = inject(UserKnowledgeService);
  
loadUserKnowledgeList() {
  this.userKnowledgeService.getUserKnowledgeList().subscribe((res: any) => {
    this.userKnowledgeList.set(res.data); // Actualiza la señal
    console.log("----userKnowledgeList cargado:", res.data);
  });
}


  filteredTechnicians = computed(() => {
    const sections = this.selectedSections(); // Secciones seleccionadas
    const knowledges = this.selectedKnowledges(); // Conocimientos seleccionados

    // IDs de secciones y conocimientos
    const sectionIds = sections.map(section => section.id_section);
    const knowledgeIds = knowledges.map(knowledge => knowledge.id_knowledge);


    // Obtener IDs de conocimientos asociados a las secciones seleccionadas
    const filteredKnowledgeIds = knowledgeIds.filter(id =>
      sections.some(section => section.id_section === id)
    );
    console.log("- - - -filteredKnowledgeIds", filteredKnowledgeIds);
    

       // Obtener IDs de usuarios asociados a los conocimientos filtrados
  const filteredUserIds = this.userKnowledgeList()
  .filter(userKnowledge => filteredKnowledgeIds.includes(userKnowledge.knowledge_id))
  .map(userKnowledge => userKnowledge.user_id);

// Devuelve los IDs únicos
return Array.from(new Set(filteredUserIds));
  
  });


  setTechnicianList(techniciansList: User[]) {
    this.techniciansFiltred.set(techniciansList);
    // console.log("++++++techniciansList", this.techniciansFiltred());


  }

  setSelectedSections(sections: Section[]) {
    this.selectedSections.set(sections);
    // console.log("¨¨¨¨¨sections", this.selectedSections());

  }

  setSelectedKnowledges(knowledges: Knowledge[]) {
    this.selectedKnowledges.set(knowledges);
    // console.log("^^^^^^^knowledges", this.selectedKnowledges());
  }
}
