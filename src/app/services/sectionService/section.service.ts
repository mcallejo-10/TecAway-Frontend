/* eslint-disable */ 

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Section, SectionListResponse } from '../../interfaces/section';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);
  
  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/section';
  }
  sectionList = signal<Section[]>([]);


  getSectionList(): Observable<SectionListResponse> {
    return this.http.get<SectionListResponse>(this.myAppUrl + this.myApiUrl);
  }

  getSectionById(id: number): Observable<Section> {
    return this.http.get<Section>(this.myAppUrl + this.myApiUrl + id);
  }

  saveSection(section: Section): Observable<any> {
    return this.http.post<Section>(this.myAppUrl + this.myApiUrl, section);
  }

  updateSection(section: Section): Observable<any> {
    return this.http.put<Section>(this.myAppUrl + this.myApiUrl + section.id_section, section);
  }

  deleteSection(id: number): Observable<any> {
    return this.http.delete(this.myAppUrl + this.myApiUrl + id);
  }

  setSectionList(sectionList: Section[]): void {
    this.sectionList.set(sectionList);
  }
}
