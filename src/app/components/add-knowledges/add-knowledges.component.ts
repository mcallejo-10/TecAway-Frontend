import { Component, inject } from '@angular/core';
import { UserService } from '../../services/userService/user.service';
import { SectionService } from '../../services/sectionService/section.service';
import { KnowledgeService } from '../../services/knowledgeService/knowledge.service';
import { Knowledge } from '../../interfaces/knowledge';
import { Section } from '../../interfaces/section';
import { UserKnowledgeService } from '../../services/userKowledgeService/user-knowledge.service';
import { User } from '../../interfaces/user';
import { UserKnowledge } from '../../interfaces/user-knowledge';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrModule, ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-add-knowledges',
  imports: [],
  templateUrl: './add-knowledges.component.html',
  styleUrl: './add-knowledges.component.scss',
})
export class AddKnowledgesComponent {
  userService = inject(UserService);
  sectionService = inject(SectionService);
  knowledgeService = inject(KnowledgeService);
  userKnowledgeService = inject(UserKnowledgeService);

  errorMessage: string = '';

  selectedKnowledges: number[] = [1];  // Mantenemos el 1 inicial
  sectionList: Section[] = [];
  knowledgeList: Knowledge[] = [];

  userKnowledgeIds: number[] = [];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.userKnowledgeService.getUserKnowledgesById().subscribe((res: any) => {
      // Creamos un nuevo array con los valores del backend
      const backendKnowledges = res.data.map((userKnowledge: UserKnowledge) => userKnowledge.knowledge_id);
      this.userKnowledgeIds = [...backendKnowledges];
      
      // Aseguramos que el 1 esté incluido en selectedKnowledges
      this.selectedKnowledges = [...new Set([1, ...backendKnowledges])];
      
      this.sectionService.getSectionList().subscribe((res: any) => {
        this.sectionService.setSectionList(res.data);
        this.sectionList = this.sectionService.sectionList();
      });
      
      this.knowledgeService.getKnowledgeList().subscribe((res: any) => {
        this.knowledgeService.setKnowledgeList(res.data);
        this.knowledgeList = this.knowledgeService.knowledgeList();
      });
    });
  }

  isSelected(knowledgeId: number): boolean {
    return this.selectedKnowledges.includes(knowledgeId);
  }

  toggleKnowledge(knowledgeId: number): void {
    // No permitimos deseleccionar el ID 1
    if (knowledgeId === 1) return;

    const index = this.selectedKnowledges.indexOf(knowledgeId);
    if (index === -1) {
      this.selectedKnowledges = [...this.selectedKnowledges, knowledgeId];
    } else {
      this.selectedKnowledges = this.selectedKnowledges.filter(id => id !== knowledgeId);
    }
  }
  saveKnowledges(): void {
     if (!this.selectedKnowledges.includes(1)) {
      this.selectedKnowledges.unshift(1); 
    }

    const knowledgesToAdd = this.selectedKnowledges.filter(id => !this.userKnowledgeIds.includes(id));
    const knowledgesToDelete = this.userKnowledgeIds.filter(id => !this.selectedKnowledges.includes(id));
      
    const operations = [
      ...knowledgesToAdd.map(id =>
        this.userKnowledgeService.addKnowledge({ knowledge_id: id }).pipe(
          catchError(error => {
            console.error(`Error al agregar knowledge ${id}:`, error);
            return of(null);
          })
        )
      ),
      ...knowledgesToDelete.map(id =>        
        this.userKnowledgeService.deleteUserKnowledge(id ).pipe(
          catchError(error => {
            console.error(`Error al eliminar knowledge ${id}:`, error);
                  
            return of(null);
          })
        )
      )
    ];
  
    if (operations.length === 0) {
      this.toastr.info('No hay cambios en los conocimientos');
      return;
    }
      
    forkJoin(operations).pipe(
      finalize(() => this.toastr.success('Conocimientos actualizados correctamente'))
    ).subscribe({
      next: results => console.log('Operaciones completadas:', results),
      error: error => {
        console.error('Error en las operaciones:', error);
        this.toastr.error('Error al actualizar los conocimientos', 'Error');
      }
    });
  }  
  
}
