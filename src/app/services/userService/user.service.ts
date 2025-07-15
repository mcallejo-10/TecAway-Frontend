import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { User, UserResponse } from '../../interfaces/user';
import { UserInfoResponse } from '../../interfaces/user-info';

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

  checkEmailExists(data: { email: string }): Observable<boolean> {
    return this.http.post<boolean>(this.myAppUrl + this.myApiUrl + 'check-email', data);
  }

  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(this.myAppUrl + this.myApiUrl + 'get-all-users');
  }

  getUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.myAppUrl + this.myApiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.myAppUrl + this.myApiUrl + 'get-user/' + id);
  }

  updateUser(user: User): Observable<any> {
    return this.http.patch(this.myAppUrl + this.myApiUrl, user);
  }

  uploadPhoto(photo: File): Observable<any> {
    console.log('=== SUBIENDO FOTO ===');
    console.log('Archivo a subir:', {
      name: photo.name,
      type: photo.type,
      size: photo.size
    });
    
    const formData = new FormData();
    formData.append('file', photo);
    
    // Log del FormData (para debugging)
    console.log('FormData creado para:', photo.name);
    
    // Headers específicos para mejor compatibilidad con iOS
    const headers = {
      'Accept': 'application/json'
      // No incluir Content-Type, Angular lo manejará automáticamente con FormData
    };
    
    return this.http.post<any>(this.myAppUrl + this.myApiUrl + 'upload-photo', formData, {
      headers,
      withCredentials: true,
      reportProgress: true // Para poder mostrar progreso si es necesario
    });
  }

  getUserInfo(id: number): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(this.myAppUrl + this.myApiUrl + 'get-user-info/' + id);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.myAppUrl}${this.myApiUrl}${id}`, {
      withCredentials: true
    });
  }
}
