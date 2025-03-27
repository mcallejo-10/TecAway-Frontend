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
  serviceLoading = signal<boolean>(true);
  techniciansFiltred = signal<User[]>([]);
  selectedSections: WritableSignal<Section[]> = signal([]);
  selectedKnowledges = signal<Knowledge[]>([]);
  userKnowledgeList = signal<UserKnowledge[]>([]);
  filteredIds = signal<number[]>([]);
  userKnowledgeService = inject(UserKnowledgeService);
  knowledgeService = inject(KnowledgeService);
  allKnowledges: Knowledge[] = this.knowledgeService.knowledgeList();

  loadUserKnowledgeList() {
    this.userKnowledgeService.getUserKnowledgeList().subscribe((res: any) => {
      this.userKnowledgeList.set(res.data); // Actualiza la señal    
    });
  }


  filteredBySections(): number[] {
    const sections = this.selectedSections();
    const knowledges = this.selectedKnowledges();

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
      .filter(([userId, knowledgeIds]) =>
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
    const selectedKnowledgeIds = this.selectedKnowledges().map(knowledge => knowledge.id_knowledge);
    const selectedSectionIds = this.selectedSections().map(section => section.id_section);

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
    const filteredUserIdsByTown = filteredUserIds.filter(userId => {
      const user = this.techniciansFiltred().find(t => t.id_user === userId);
      return user?.town === town;
    });
    return filteredUserIdsByTown;
  }

  filterTechnicians(): number[] {
    const sectionFilteredIds = this.filteredBySections();
    const knowledgeFilteredIds = this.filterByKnowledges(sectionFilteredIds);
    return knowledgeFilteredIds

  }

  // setTechnicianList(techniciansList: User[]) {
  //   this.techniciansFiltred.set(techniciansList);
  // }

  setSelectedSections(sections: Section[]) {
    this.selectedSections.set(sections);
  }

  setSelectedKnowledges(knowledges: Knowledge[]) {
    this.selectedKnowledges.set(knowledges);
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

