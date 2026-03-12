import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionSummary, AnalysisResponse } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient) {}

  /**
   * Get all transactions
   */
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  /**
   * Get a single transaction by ID
   */
  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new transaction
   */
  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(id: string, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get transactions filtered by category
   */
  getTransactionsByCategory(category: string): Observable<Transaction[]> {
    let params = new HttpParams().set('category', category);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter/category`, { params });
  }

  /**
   * Get transactions filtered by date range
   */
  getTransactionsByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter/date`, { params });
  }

  /**
   * Get transactions filtered by type
   */
  getTransactionsByType(type: 'INCOME' | 'EXPENSE'): Observable<Transaction[]> {
    let params = new HttpParams().set('type', type);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter/type`, { params });
  }

  /**
   * Get monthly summary
   */
  getMonthSummary(year: number, month: number): Observable<TransactionSummary> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<TransactionSummary>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * Request AI-powered analysis for a month/year
   */
  getAnalysis(year: number, month: number): Observable<AnalysisResponse> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    // note: analysis endpoint is served at root /analysis rather than under /transactions
    return this.http.get<AnalysisResponse>('http://localhost:8080/analysis', { params });
  }
}
