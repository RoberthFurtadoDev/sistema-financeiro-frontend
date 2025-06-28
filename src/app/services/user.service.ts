// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model'; // Importa o modelo User (do frontend)
import { AuthService } from './auth.service'; // Para obter o token

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users'; // Endpoint base para User

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

  // Obter o perfil do usuário logado
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers: this.getAuthHeaders() });
  }

  // Atualizar o perfil do usuário logado
  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, user, { headers: this.getAuthHeaders() });
  }

  // Futuramente, método para mudar senha (se precisar de um endpoint PUT separado)
  // changePassword(changePasswordData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/change-password`, changePasswordData, { headers: this.getAuthHeaders() });
  // }
}
