import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Section } from '../../interfaces/section';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private myAppUrl: string;
  private myApiUrl: string;
  constructor(private http: HttpClient) { 
        this.myAppUrl = environment.endpoint;
        this.myApiUrl = '/api/section';
  }

  getSectionList() {
    return this.http.get(this.myAppUrl + this.myApiUrl);
  }

  getSectionById(id: number) {
    return this.http.get(this.myAppUrl + this.myApiUrl + id);
  }

  saveSection(section: Section) {
    return this.http.post(this.myAppUrl + this.myApiUrl, section);
  }

  updateSection(section: Section) {
    return this.http.put(this.myAppUrl + this.myApiUrl + section.id_section, section);
  }

  deleteSection(id: number) {
    return this.http.delete(this.myAppUrl + this.myApiUrl + id);
  }
}
