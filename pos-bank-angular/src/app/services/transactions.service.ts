import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, TransactionInput } from '../models/transaction.model';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, description: 'Supermercado Silva', category: 1, value: -350.0, date: '2026-03-10', type: 'expense' },
  { id: 2, description: 'Salário', category: 2, value: 5000.0, date: '2026-03-01', type: 'income' },
  { id: 3, description: 'Farmácia Central', category: 3, value: -120.0, date: '2026-02-28', type: 'expense' },
  { id: 4, description: 'Restaurante do Porto', category: 1, value: -180.0, date: '2026-02-27', type: 'expense' },
  { id: 5, description: 'Freelance Tech', category: 2, value: 1500.0, date: '2026-02-25', type: 'income' },
  { id: 6, description: 'Conta de Luz', category: 4, value: -250.0, date: '2026-02-20', type: 'expense' },
];

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>(INITIAL_TRANSACTIONS);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor() {}

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  getCurrentTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  addTransaction(input: TransactionInput): void {
    const current = this.transactionsSubject.value;
    const nextId = current.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    const newTransaction: Transaction = { id: nextId, ...input };
    this.transactionsSubject.next([newTransaction, ...current]);
  }

  updateTransaction(id: number, input: TransactionInput): void {
    const current = this.transactionsSubject.value;
    const updated = current.map(t => (t.id === id ? { ...t, ...input } : t));
    this.transactionsSubject.next(updated);
  }

  deleteTransaction(id: number): void {
    const current = this.transactionsSubject.value;
    const filtered = current.filter(t => t.id !== id);
    this.transactionsSubject.next(filtered);
  }
}
