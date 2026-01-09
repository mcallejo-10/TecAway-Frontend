/* eslint-disable */ 

import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../interfaces/user';
import { Section } from '../../interfaces/section';
import { Knowledge } from '../../interfaces/knowledge';
import { UserKnowledgeService } from '../userKowledgeService/user-knowledge.service';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { KnowledgeService } from '../knowledgeService/knowledge.service';
import { TechnicianStateService } from '../state/technician-state.service';


@Injectable({
  providedIn: 'root'
})
export class FilterService {

  // 🔄 Inyectamos el servicio de estado centralizado
  private stateService = inject(TechnicianStateService);
  private userKnowledgeService = inject(UserKnowledgeService);
  private knowledgeService = inject(KnowledgeService);

  // ⚠️ DEPRECATED: Mantener por compatibilidad temporal
  serviceLoading = signal<boolean>(true);
  techniciansFiltred = signal<User[]>([]);
  filteredIds = signal<number[]>([]);
  
  userKnowledgeList = signal<UserKnowledge[]>([]);
  allKnowledges: Knowledge[] = this.knowledgeService.knowledgeList();

  constructor() {
    this.loadUserKnowledgeList(); // Cargar los datos
  }

  loadUserKnowledgeList() {
    this.userKnowledgeService.getUserKnowledgeList().subscribe((res: any) => {
      this.userKnowledgeList.set(res.data); // Actualiza la señal    
    });
  }


  filteredBySections(): number[] {
    // 🔄 Ahora leemos del estado centralizado
    const sections = this.stateService.selectedSections();
    const knowledges = this.stateService.selectedKnowledges();

    const sectionIds = sections.map(section => section.id_section);

    // const filteredKnowledgeIds = knowledges
    //   .filter(knowledge => sectionIds.includes(knowledge.section_id))
    //   .map(knowledge => knowledge.id_knowledge);

    const userToKnowledgeMap = new Map<number, number[]>();

    this.userKnowledgeList().forEach(userKnowledge => {
      const { user_id, knowledge_id } = userKnowledge;
      if (!userToKnowledgeMap.has(user_id)) {
        userToKnowledgeMap.set(user_id, []);
      }
      userToKnowledgeMap.get(user_id)?.push(knowledge_id);
    });

    const filteredUserIds = Array.from(userToKnowledgeMap.entries())
      .filter(([, knowledgeIds]) =>
        sectionIds.every(sectionId =>
          knowledges.some(
            knowledge =>
              knowledge.section_id === sectionId && knowledgeIds.includes(knowledge.id_knowledge!)
          )
        )
      )
      .map(([userId]) => userId);


    return Array.from(new Set(filteredUserIds)); // Elimina duplicados
  }

  filterByKnowledges(userIds: number[]): number[] {
    // 🔄 Ahora leemos del estado centralizado
    const selectedKnowledgeIds = this.stateService.selectedKnowledges().map(knowledge => knowledge.id_knowledge);
    const selectedSectionIds = this.stateService.selectedSections().map(section => section.id_section);

    return userIds.filter(userId => {
      const userKnowledge = this.userKnowledgeList().filter(uk => uk.user_id === userId);

      if (selectedKnowledgeIds.length === 0) {
        return userKnowledge.some(uk => {
          const knowledgeSectionId = this.allKnowledges.find(k => k.id_knowledge === uk.knowledge_id)?.section_id;
          return knowledgeSectionId !== undefined && selectedSectionIds.includes(knowledgeSectionId);
        });
      } else {
        const userKnowledgeIds = userKnowledge.map(uk => uk.knowledge_id);
        return selectedKnowledgeIds.every(knowledgeId => userKnowledgeIds.includes(knowledgeId!));
      }
    });
  }



  filterByTown(town: string): number[] {
    const filteredUserIds = this.filteredBySections();
    return filteredUserIds.filter(userId => {
      const user = this.techniciansFiltred().find(t => t.id_user === userId);
      return user?.town === town;
    });
  }

  filterTechnicians(): number[] {
    const sectionFilteredIds = this.filteredBySections();
    return this.filterByKnowledges(sectionFilteredIds)
  }

  // ⚠️ DEPRECATED: Usar stateService.setSelectedSections() directamente
  setSelectedSections(sections: Section[]) {
    this.stateService.setSelectedSections(sections);
  }

  // ⚠️ DEPRECATED: Usar stateService.setSelectedKnowledges() directamente
  setSelectedKnowledges(knowledges: Knowledge[]) {
    this.stateService.setSelectedKnowledges(knowledges);
  }

  // En filter.service.ts
  setTechnicianList(technicians: User[]): void {
    const sortedTechnicians = this.sortTechniciansByDate(technicians);
    this.techniciansFiltred.set(sortedTechnicians);
  }
  
  private sortTechniciansByDate(technicians: User[]): User[] {
    return technicians.sort((a: User, b: User) => {
      return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
    });
  }
}

