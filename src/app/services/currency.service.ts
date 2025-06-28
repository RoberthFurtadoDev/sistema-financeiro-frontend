// src/app/services/currency.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyApiResponse } from '../models/currency.model'; // <--- CORREÇÃO: Importa a interface CurrencyApiResponse
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8081/api/currency';

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

  getLatestRates(baseCurrency: string): Observable<CurrencyApiResponse> {
    return this.http.get<CurrencyApiResponse>(`${this.apiUrl}/rates/${baseCurrency.toUpperCase()}`, { headers: this.getAuthHeaders() });
  }
}
