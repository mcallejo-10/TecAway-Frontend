import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledgeService } from '../userKowledgeService/user-knowledge.service';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { KnowledgeService } from '../knowledgeService/knowledge.service';


@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() {
    this.loadUserKnowledgeList(); // Cargar los datos
  }
  techniciansFiltred = signal<User[]>([]);
  selectedSections: WritableSignal<Section[]> = signal([]);
  selectedKnowledges = signal<Knowledge[]>([]);
  userKnowledgeList = signal<UserKnowledge[]>([]);
  filteredIsd = signal<number[]>([]);
  userKnowledgeService = inject(UserKnowledgeService);
  knowledgeService = inject(KnowledgeService);
  allKnowledges: Knowledge[] = this.knowledgeService.knowledgeList();

  loadUserKnowledgeList() {
    this.userKnowledgeService.getUserKnowledgeList().subscribe((res: any) => {
      this.userKnowledgeList.set(res.data); // Actualiza la señal    
    });
  }


  filteredBySections(): number[] {
    const sections = this.selectedSections(); // Secciones seleccionadas
    const knowledges = this.selectedKnowledges(); // Conocimientos seleccionados

    // IDs de secciones seleccionadas
    const sectionIds = sections.map(section => section.id_section);

    // Filtrar conocimientos que pertenezcan a las secciones seleccionadas
    const filteredKnowledgeIds = knowledges
      .filter(knowledge => sectionIds.includes(knowledge.section_id))
      .map(knowledge => knowledge.id_knowledge);

    // Agrupar usuarios por sus conocimientos asociados
    const userToKnowledgeMap = new Map<number, number[]>();

    this.userKnowledgeList().forEach(userKnowledge => {
      const { user_id, knowledge_id } = userKnowledge;
      if (!userToKnowledgeMap.has(user_id)) {
        userToKnowledgeMap.set(user_id, []);
      }
      userToKnowledgeMap.get(user_id)?.push(knowledge_id);
    });

    // Filtrar usuarios que tengan conocimientos correspondientes a **todas las secciones seleccionadas**
    const filteredUserIds = Array.from(userToKnowledgeMap.entries())
      .filter(([userId, knowledgeIds]) =>
        sectionIds.every(sectionId =>
          knowledges.some(
            knowledge =>
              knowledge.section_id === sectionId && knowledgeIds.includes(knowledge.id_knowledge!)
          )
        )
      )
      .map(([userId]) => userId);

    // Devolver los IDs únicos
    return Array.from(new Set(filteredUserIds)); // Eliminar duplicados si es necesario
  }

  filterByKnowledges(userIds: number[]): number[] {
    const selectedKnowledgeIds = this.selectedKnowledges().map(knowledge => knowledge.id_knowledge); // Conocimientos seleccionados
    const selectedSectionIds = this.selectedSections().map(section => section.id_section); // Secciones seleccionadas
  
    return userIds.filter(userId => {
      const userKnowledge = this.userKnowledgeList().filter(uk => uk.user_id === userId);
  
      if (selectedKnowledgeIds.length === 0) {
        // Si no hay conocimientos seleccionados, validamos que el usuario tenga algún conocimiento de las secciones seleccionadas
        return userKnowledge.some(uk => {
          const knowledgeSectionId = this.allKnowledges.find(k => k.id_knowledge === uk.knowledge_id)?.section_id;
          // Validar que el conocimiento pertenezca a alguna de las secciones seleccionadas
          return knowledgeSectionId !== undefined && selectedSectionIds.includes(knowledgeSectionId);
        });
      } else {
        // Si hay conocimientos seleccionados, validamos que el usuario tenga TODOS los conocimientos seleccionados
        const userKnowledgeIds = userKnowledge.map(uk => uk.knowledge_id);
        return selectedKnowledgeIds.every(knowledgeId => userKnowledgeIds.includes(knowledgeId!));
      }
    });
  }
  
  
  
  
  

  filterTechnicians(): number[] {
    const sectionFilteredIds = this.filteredBySections(); // IDs filtrados por secciones
    const knowledgeFilteredIds = this.filterByKnowledges(sectionFilteredIds); // Filtrar esos IDs por conocimientos

    return knowledgeFilteredIds
    
  }

  setTechnicianList(techniciansList: User[]) {
    this.techniciansFiltred.set(techniciansList);
    // this.filterTechnicians();
  


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
