// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ChangePasswordRequest } from '../models/change-password-request.model'; // <--- NOVO IMPORT
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers: this.getAuthHeaders() });
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, user, { headers: this.getAuthHeaders() });
  }

  // <--- NOVO MÉTODO: Mudar Senha ---
  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/change-password`, request, {
        headers: this.getAuthHeaders(),
        responseType: 'text' // O backend retorna uma String de sucesso
    });
  }
}
