import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../../interfaces/user';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    this.myApiUrl = '/auth/';
  }

  private httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  registerUser(user: User): Observable<any> {
    return this.http.post<User>(this.myAppUrl + this.myApiUrl + 'register', user
    ).pipe(
      tap(() => this.isLogged.set(false))
    );
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post(this.myAppUrl + this.myApiUrl + 'forgot-password', email);
  }

  changePassword(user: User): Observable<any> {
    return this.http.post(this.myAppUrl + this.myApiUrl + 'change-password', user);
  }


  logoutUser(): Observable<any> {
    return this.http.get(
      `${this.myAppUrl}${this.myApiUrl}logout`,
      { withCredentials: true }  // Importante para enviar/recibir cookies
    ).pipe(
      tap(() => {
        this.isLogged.set(false);
        // Limpiar cualquier estado local si es necesario
        localStorage.removeItem('user');
        sessionStorage.clear();
      })
    );
  }

  loginUser(loginRequest: LoginRequest): Observable<any> {
    return this.http.post(
      `${this.myAppUrl}${this.myApiUrl}login`,
      loginRequest,
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('Login exitoso');
        this.isLogged.set(true);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        this.isLogged.set(false);
        return throwError(() => error);
      })
    );
  }


  checkAuthStatus(): Observable<any> {
    return this.http.get(
      `${this.myAppUrl}${this.myApiUrl}check-auth`,
      { withCredentials: true }
    ).pipe(
      tap(() => this.isLogged.set(true)),
      catchError(error => {
        this.isLogged.set(false);
        return throwError(() => error);
      })
    );
  }

  isLoggedIn() {
    return this.isLogged();
  }

  sendEmail(email: string, message: string, name: string): Observable<any> {
    const emailData = { email, message, name };
    return this.http.post(this.myAppUrl + this.myApiUrl + 'forgot-password', emailData);
  }
}


