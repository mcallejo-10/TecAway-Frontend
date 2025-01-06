import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) { 
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/user/';
  }

  checkEmailExists(email: string): Observable<any> {
    console.log("email:", email);
    
    return this.http.post(this.myAppUrl + this.myApiUrl + 'check-email', {email});
  }
  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(this.myAppUrl + this.myApiUrl + 'get-all-users');  
  }

  getUser(): Observable<User> {
    return this.http.get<User>(this.myAppUrl + this.myApiUrl);
  }
  getUserById(id: number): Observable<User> {
    console.log("id:", id);
    
    return this.http.get<User>(this.myAppUrl + this.myApiUrl + 'get-user/' + id);
  }

  updateUser(user: User): Observable<any> {
    return this.http.patch(this.myAppUrl + this.myApiUrl, user);
    
  }

  uploadPhoto(photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', photo);
    return this.http.post<any>(this.myAppUrl + this.myApiUrl + 'upload-photo', formData);
  }

  getUserInfo(id: number): Observable<User> {
    return this.http.get<User>(this.myAppUrl + this.myApiUrl + 'get-user-info/' + id);
  }
}
