// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model'; // Importação da interface Transaction
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8081/api/transactions'; // Endpoint do backend para transações

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

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    const transactionToSend = {
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      categoryId: transaction.categoryId, // Usando categoryId, conforme o DTO
      type: transaction.type
    };
    return this.http.post<Transaction>(this.apiUrl, transactionToSend, { headers: this.getAuthHeaders() });
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    const transactionToSend = {
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      categoryId: transaction.categoryId, // Usando categoryId, conforme o DTO
      type: transaction.type
    };
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transactionToSend, { headers: this.getAuthHeaders() });
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
