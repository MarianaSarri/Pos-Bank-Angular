import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { environment } from '../../env/environment.development';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../models/transaction.model';

const TRANSACTIONS_STORAGE_KEY = 'pos-bank-transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private transactionAdded$ = new Subject<Transaction>();

  constructor() {}

  onTransactionAdded(): Observable<Transaction> {
    return this.transactionAdded$.asObservable();
  }

  private getFromStorage(): Transaction[] {
    const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(transactions: Transaction[]): void {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  }

  private addToStorage(transaction: Transaction): void {
    const transactions = this.getFromStorage();
    transactions.unshift(transaction);
    this.saveToStorage(transactions);
  }

  private removeFromStorage(id: number): void {
    const transactions = this.getFromStorage().filter(t => t.id !== id);
    this.saveToStorage(transactions);
  }

  private updateInStorage(transaction: Transaction): void {
    const transactions = this.getFromStorage();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      transactions[index] = transaction;
      this.saveToStorage(transactions);
    }
  }

  private paginateData(data: Transaction[], page: number, limit: number): PaginatedTransactionsResponse {
    const total = data.length;
    const totalPages = limit > 0 ? Math.ceil(total / limit) || 1 : 1;
    const startIndex = (page - 1) * limit;
    return {
      data: data.slice(startIndex, startIndex + limit),
      page,
      limit,
      total,
      totalPages
    };
  }

  private getFilteredFromStorage(filters?: TransactionFilters): Transaction[] {
    let transactions = this.getFromStorage();
    if (filters?.search?.trim()) {
      const term = filters.search.toLowerCase();
      transactions = transactions.filter(t => t.description?.toLowerCase().includes(term));
    }
    if (filters?.type && filters.type !== 'all') {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    return transactions;
  }

  getTransactions(page: number = 1, limit: number = 10, filters?: TransactionFilters): Observable<PaginatedTransactionsResponse> {
    const cached = this.getFilteredFromStorage(filters);
    if (cached.length > 0) {
      return of(this.paginateData(cached, page, limit));
    }

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
    return this.http.post<Transaction>(environment.apiUrl + '/transactions', input).pipe(
      tap((transaction) => {
        this.addToStorage(transaction);
        this.transactionAdded$.next(transaction);
      })
    );
  }

  updateTransaction(id: number, input: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(environment.apiUrl + '/transactions/' + id, input).pipe(
      tap((transaction) => this.updateInStorage(transaction))
    );
  }

  deleteTransaction(id: number) {
    this.removeFromStorage(id)
  }
}
