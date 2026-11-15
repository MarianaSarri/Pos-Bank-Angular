import { Observable } from 'rxjs';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../../models/transaction.model';

export interface TransactionsRepository {
  getTransactions(page: number, limit: number, filters?: TransactionFilters): Observable<PaginatedTransactionsResponse>;
  addTransaction(input: Transaction): Observable<Transaction>;
  updateTransaction(id: number, input: Transaction): Observable<Transaction>;
  deleteTransaction(id: number): Observable<void>;
}