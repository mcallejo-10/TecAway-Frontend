import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Knowledge } from '../../interfaces/knowledge';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private myAppUrl: string;
  private myApiUrl: string;
  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/api/knowledge/';
   }

   getKnowledgeList(): Observable<Knowledge[]> {
     return this.http.get<Knowledge[]>(this.myAppUrl + this.myApiUrl);
   }

   getKnowledgeById(id: number): Observable<Knowledge> {
     return this.http.get<Knowledge>(this.myAppUrl + this.myApiUrl + id);
   }

    saveKnowledge(knowledge: Knowledge): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl, knowledge);
    }

    updateKnowledge(knowledge: Knowledge): Observable<any> {
      return this.http.put(this.myAppUrl + this.myApiUrl + knowledge.id_knowledge, knowledge);
    }

    deleteKnowledge(id: number): Observable<any> {
      return this.http.delete(this.myAppUrl + this.myApiUrl + id);
    }
}
