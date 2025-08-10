import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Knowledge } from '../../interfaces/knowledge';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);
  
  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/knowledge/';
  }

  knowledgeList = signal<Knowledge[]>([]);

  getKnowledgeList(): Observable<Knowledge[]> {
    return this.http.get<Knowledge[]>(this.myAppUrl + this.myApiUrl);
  }

  getKnowledgeById(id: number): Observable<Knowledge> {
    return this.http.get<Knowledge>(this.myAppUrl + this.myApiUrl + id);
  }

  saveKnowledge(knowledge: Knowledge): Observable<any> {
    return this.http.post<Knowledge>(this.myAppUrl + this.myApiUrl, knowledge);
  }

  updateKnowledge(knowledge: Knowledge): Observable<any> {
    return this.http.put<Knowledge>(this.myAppUrl + this.myApiUrl + knowledge.id_knowledge, knowledge);
  }

  deleteKnowledge(id: number): Observable<any> {
    return this.http.delete(this.myAppUrl + this.myApiUrl + id);
  }

  setKnowledgeList(knowledgeList: Knowledge[]): void {
    this.knowledgeList.set(knowledgeList);
  }
}
