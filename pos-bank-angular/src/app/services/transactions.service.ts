import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../models/transaction.model';
import { TRANSACTIONS_REPOSITORY } from '../transactions/infrastructure/transactions-repository.token';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly repository = inject(TRANSACTIONS_REPOSITORY);

  getTransactions(page: number = 1, limit: number = 10, filters?: TransactionFilters): Observable<PaginatedTransactionsResponse> {
    return this.repository.getTransactions(page, limit, filters);
  }

  addTransaction(input: Transaction): Observable<Transaction> {
    return this.repository.addTransaction(input);
  }

  updateTransaction(id: number, input: Transaction): Observable<Transaction> {
    return this.repository.updateTransaction(id, input);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.repository.deleteTransaction(id);
  }
}
