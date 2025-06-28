// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081/api/auth';
  private tokenKey = 'authToken';
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData, { responseType: 'text' });
  }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      map((response: any) => {
        if (response && response.token) {
          this.saveToken(response.token);
        }
        return response;
      })
    );
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && this.isBrowser && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    if (!this.isBrowser) {
      return false;
    }
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate.getTime() < new Date().getTime();
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  // <--- CORREÇÃO AQUI: Obter 'display_name' do token --->
  getUsernameFromToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    const token = this.getToken();
    if (token) {
      try {
        // Tipagem para incluir o claim personalizado 'display_name'
        const decodedToken: { sub: string, display_name?: string } = jwtDecode(token);
        return decodedToken.display_name || decodedToken.sub || null; // Prioriza display_name, senão usa sub (email)
      } catch (error) {
        console.error('Erro ao decodificar token para obter username:', error);
        return null;
      }
    }
    return null;
  }
}
