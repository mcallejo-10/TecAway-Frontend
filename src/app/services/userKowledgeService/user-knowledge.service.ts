import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { UserKnowledge } from '../../interfaces/user-knowledge';

@Injectable({
  providedIn: 'root'
})
export class UserKnowledgeService {
  private myAppUrl: string;
  private myApiUrl: string;
  constructor(private http: HttpClient) {
        this.myAppUrl = environment.endpoint;
        this.myApiUrl = '/user-knowledge/';
   }

    getUserKnowledgeList(): Observable<UserKnowledge[]> {
      return this.http.get<UserKnowledge[]>(this.myAppUrl + this.myApiUrl);
    }

    getUserKnowledgesById(): Observable<UserKnowledge> {
      return this.http.get<UserKnowledge>(this.myAppUrl + this.myApiUrl + 'user'); 
    }

    addKnowledge(knowledge_id: any): Observable<any> {
      console.log('knowledge_id:', knowledge_id);
      
      return this.http.post<any>(this.myAppUrl + this.myApiUrl, knowledge_id);
    }

    deleteUserKnowledge(knowledge_id: any): Observable<any> {
      return this.http.delete<any>(this.myAppUrl + this.myApiUrl, {
        body: {knowledge_id: knowledge_id}
      });
    }

}
