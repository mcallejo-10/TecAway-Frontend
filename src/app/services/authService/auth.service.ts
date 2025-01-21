import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../../interfaces/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private myAppUrl: string;
  private myApiUrl: string;
  isLogged = signal<boolean>(false);
  
  constructor(private http: HttpClient) {  
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = '/auth/';}

    
    registerUser(user: User): Observable<any> {
      return this.http.post<User>(this.myAppUrl + this.myApiUrl + 'register', user);
    }

    loginUser(loginRequest: LoginRequest): Observable<any> {
      return this.http.post(this.myAppUrl + this.myApiUrl + 'login', loginRequest);
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

    isLoggedIn() {
      const token = sessionStorage.getItem('authToken');
      if (token != null) {
        this.isLogged.set(true);
      } else {
        this.isLogged.set(false);
      }
    }


}


