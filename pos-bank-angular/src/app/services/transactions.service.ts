import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {}

  getTransactions(page: number = 1, limit: number = 10, filters?: TransactionFilters): Observable<PaginatedTransactionsResponse> {
    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    if (filters?.search?.trim()) {
      params = params.set('q', filters.search.trim());
    }

    if (filters?.type && filters.type !== 'all') {
      params = params.set('type', filters.type);
    }

    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, {
      params,
      observe: 'response'
    }).pipe(
      map((response) => {
        const total = Number(response.headers.get('x-total-count') ?? '0');
        const totalPages = limit > 0 ? Math.ceil(total / limit) || 1 : 1;
        return {
          data: response.body ?? [],
          page,
          limit,
          total,
          totalPages
        };
      })
    );
  }

  addTransaction(input: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, input);
  }

  updateTransaction(id: number, input: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, input);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  }
}
