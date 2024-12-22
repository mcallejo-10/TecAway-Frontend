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
        this.myApiUrl = '/api/user-knowledge/';
   }

    getUserKnowledgeList(): Observable<UserKnowledge[]> {
      return this.http.get<UserKnowledge[]>(this.myAppUrl + this.myApiUrl);
    }

    getUserKnowledgeById(id: number): Observable<UserKnowledge> {
      return this.http.get<UserKnowledge>(this.myAppUrl + this.myApiUrl + id);
    }

    saveUserKnowledge(userKnowledge: UserKnowledge): Observable<any> {
      return this.http.post<UserKnowledge>(this.myAppUrl + this.myApiUrl, userKnowledge);
    }

    deleteUserKnowledge(id: number): Observable<any> {
      return this.http.delete(this.myAppUrl + this.myApiUrl + id);
    }


}
