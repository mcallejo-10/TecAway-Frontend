import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MessageData } from '../../interfaces/messageData';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private myAppUrl: string;
  private myApiUrl: string;
  


  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/api/contact/';
  }

  sendMessage(messageData: MessageData) {
    return this.http.post<any>(
      this.myAppUrl + this.myApiUrl + 'send-message', messageData);
  }
}