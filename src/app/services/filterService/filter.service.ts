import { Injectable, signal } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  techniciansFiltred = signal<User[]>([]);
  selectedSections = signal<number[]>([]);
  selectedKnowledges = signal<number[]>([]);

  setTechnicianList(techniciansList: User[]) {
    this.techniciansFiltred.set(techniciansList);
  }

  setSelectedSections(sections: number[]) {
    this.selectedSections.set(sections);
  }

  setSelectedKnowledges(knowledges: number[]) {
    this.selectedKnowledges.set(knowledges);
  }

  constructor() { }
}
