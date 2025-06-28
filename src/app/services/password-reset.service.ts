// src/app/services/password-reset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForgotPasswordRequest } from '../models/forgot-password-request.model';
import { ResetPasswordRequest } from '../models/reset-password-request.model'; // <--- CORREÇÃO: Importa ResetPasswordRequest
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = 'http://localhost:8081/api/password-reset';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    // Para estas rotas de reset, o token não é necessário pois o usuário não está logado.
    return new HttpHeaders();
  }

  requestPasswordReset(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request, {
        headers: this.getAuthHeaders(),
        responseType: 'text'
    });
  }

  // Redefine a senha com o token (para o próximo passo)
  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/reset-password`, request, {
        headers: this.getAuthHeaders(),
        responseType: 'text'
    });
  }
}
