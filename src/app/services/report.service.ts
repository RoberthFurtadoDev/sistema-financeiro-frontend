// src/app/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Balance } from '../models/balance.model';
import { Transaction } from '../models/transaction.model';
import { CategoryExpense } from '../models/category-expense.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8081/api/reports';

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

  getUserBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/balance`, { headers: this.getAuthHeaders() });
  }

  getTransactionsByPeriod(startDate: string, endDate: string): Observable<Transaction[]> {
    let params = new HttpParams();
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions-by-period`, { headers: this.getAuthHeaders(), params: params });
  }

  getTransactionsByCategory(categoryId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions-by-category/${categoryId}`, { headers: this.getAuthHeaders() });
  }

  getTotalExpensesByCategory(): Observable<CategoryExpense[]> {
    return this.http.get<CategoryExpense[]>(`${this.apiUrl}/expenses-by-category`, { headers: this.getAuthHeaders() });
  }

  getTotalIncomesByCategory(): Observable<CategoryExpense[]> {
    return this.http.get<CategoryExpense[]>(`${this.apiUrl}/incomes-by-category`, { headers: this.getAuthHeaders() });
  }
}
