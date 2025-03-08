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
  filteredIds = signal<number[]>([]);
  userKnowledgeService = inject(UserKnowledgeService);
  knowledgeService = inject(KnowledgeService);
  allKnowledges: Knowledge[] = this.knowledgeService.knowledgeList();

  loadUserKnowledgeList() {
    this.userKnowledgeService.getUserKnowledgeList().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.data)) {
          this.userKnowledgeList.set(res.data);
        } else {
          console.error('Invalid response format:', res);
          this.userKnowledgeList.set([]);
        }
      },
      error: (error) => {
        console.error('Error loading user knowledge list:', error);
        this.userKnowledgeList.set([]);
      }
    });
  }


  filteredBySections(): number[] {
    const sections = this.selectedSections();
    const knowledges = this.selectedKnowledges();
    const sectionIds = sections.map(section => section.id_section);
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

  // Añadir una señal para mantener la lista original de técnicos
  private originalTechnicians = signal<User[]>([]);

  filterTechnicians(): number[] {
    if (this.selectedSections().length === 0 && this.selectedKnowledges().length === 0) {
      return this.originalTechnicians().map(tech => tech.id_user!).filter((id): id is number => id !== undefined);
    }

    const usersBySections = this.filteredBySections();
    const filteredIds = this.filterByKnowledges(usersBySections); // Cambiado a filterByKnowledges

    const filteredTechnicians = this.originalTechnicians().filter(tech =>
      tech.id_user && filteredIds.includes(tech.id_user)
    );
    this.techniciansFiltred.set(filteredTechnicians);

    return filteredIds;
  }

  setTechnicianList(techniciansList: User[]) {
    this.originalTechnicians.set(techniciansList); // Guardar la lista original
    this.techniciansFiltred.set(techniciansList); // Inicializar la lista filtrada
  }

  setSelectedSections(sections: Section[]) {
    this.selectedSections.set(sections);
    if (sections.length === 0) {
      // Restaurar la lista original si no hay secciones seleccionadas
      this.techniciansFiltred.set(this.originalTechnicians());
    }
  }

  setSelectedKnowledges(knowledges: Knowledge[]) {
    this.selectedKnowledges.set(knowledges);
    if (knowledges.length === 0 && this.selectedSections().length === 0) {
      // Restaurar la lista original si no hay filtros
      this.techniciansFiltred.set(this.originalTechnicians());
    }
  }
}
