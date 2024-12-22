import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private myAppUrl: string;
  private myApiUrl: string;
  
  constructor(private http: HttpClient) {  
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/api/auth/';}

    registerUser(user: User): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl + 'register', user);
    }

    loginUser(user: User): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl + 'login', user);
    }

    forgotPassword(email: string): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl + 'forgot-password', email);
    }

    changePassword(user: User): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl + 'change-password', user);
    }

    logoutUser(): Observable<any> {
      return this.http.get(this.myAppUrl + this.myApiUrl + 'logout');
    }
}


