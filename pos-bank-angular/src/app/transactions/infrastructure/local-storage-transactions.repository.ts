import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../../models/transaction.model';
import { TransactionsRepository } from '../domain/transactions.repository';

const CACHE_TTL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class LocalStorageTransactionsRepository implements TransactionsRepository {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'pos-bank-transactions';
  private readonly queryCache = new Map<string, { expiresAt: number; response: PaginatedTransactionsResponse }>();

  getTransactions(page: number = 1, limit: number = 10, filters?: TransactionFilters): Observable<PaginatedTransactionsResponse> {
    return defer(() => {
      const key = this.getCacheKey(page, limit, filters);
      const cached = this.queryCache.get(key);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        return of(cloneResponse(cached.response));
      }
      this.queryCache.delete(key);

      const search = filters?.search?.trim().toLocaleLowerCase();
      const filtered = this.readTransactions().filter((transaction) =>
        (!search || transaction.description.toLocaleLowerCase().includes(search)) &&
        (!filters?.type || filters.type === 'all' || transaction.type === filters.type)
      );
      const safeLimit = Math.max(1, limit);
      const safePage = Math.max(1, page);
      const total = filtered.length;
      const totalPages = Math.ceil(total / safeLimit) || 1;
      const response = {
        data: filtered.slice((safePage - 1) * safeLimit, safePage * safeLimit),
        page: safePage,
        limit: safeLimit,
        total,
        totalPages
      };

      this.queryCache.set(key, { expiresAt: now + CACHE_TTL_MS, response: cloneResponse(response) });
      return of(response);
    });
  }

  addTransaction(input: Transaction): Observable<Transaction> {
    return defer(() => {
      const transactions = this.readTransactions();
      const id = transactions.reduce((largest, transaction) => Math.max(largest, transaction.id ?? 0), 0) + 1;
      const created = { ...input, id };
      this.writeTransactions([created, ...transactions]);
      this.invalidateCache();
      return of(created);
    });
  }

  updateTransaction(id: number, input: Transaction): Observable<Transaction> {
    return defer(() => {
      const transactions = this.readTransactions();
      const index = transactions.findIndex((transaction) => transaction.id === id);
      if (index < 0) throw new Error('A transacao que voce tentou editar nao foi encontrada.');

      const updated = { ...input, id };
      transactions[index] = updated;
      this.writeTransactions(transactions);
      this.invalidateCache();
      return of(updated);
    });
  }

  deleteTransaction(id: number): Observable<void> {
    return defer(() => {
      const transactions = this.readTransactions();
      const remaining = transactions.filter((transaction) => transaction.id !== id);
      if (remaining.length === transactions.length) throw new Error('A transacao que voce tentou excluir nao foi encontrada.');

      this.writeTransactions(remaining);
      this.invalidateCache();
      return of(void 0);
    });
  }

  private getCacheKey(page: number, limit: number, filters?: TransactionFilters): string {
    return JSON.stringify([
      Math.max(1, page),
      Math.max(1, limit),
      filters?.search?.trim().toLocaleLowerCase() ?? '',
      filters?.type ?? 'all'
    ]);
  }

  private invalidateCache(): void {
    this.queryCache.clear();
  }

  private readTransactions(): Transaction[] {
    const stored = this.getStorage().getItem(this.storageKey);
    if (stored === null) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch {
      throw new Error('Os dados locais das transacoes estao corrompidos.');
    }
    if (!Array.isArray(parsed) || !parsed.every(isTransaction)) {
      throw new Error('Os dados locais das transacoes estao em um formato invalido.');
    }
    return parsed;
  }

  private writeTransactions(transactions: Transaction[]): void {
    try {
      this.getStorage().setItem(this.storageKey, JSON.stringify(transactions));
    } catch {
      throw new Error('Nao foi possivel salvar as transacoes neste navegador.');
    }
  }

  private getStorage(): Storage {
    try {
      const storage = this.document.defaultView?.localStorage;
      if (!storage) throw new Error('Local storage unavailable.');
      return storage;
    } catch {
      throw new Error('O armazenamento local nao esta disponivel neste navegador.');
    }
  }
}

function cloneResponse(response: PaginatedTransactionsResponse): PaginatedTransactionsResponse {
  return {
    ...response,
    data: response.data.map((transaction) => ({
      ...transaction,
      attachments: transaction.attachments?.map((attachment) => ({ ...attachment }))
    }))
  };
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const transaction = value as Partial<Transaction>;
  return (transaction.id === undefined || typeof transaction.id === 'number') &&
    typeof transaction.description === 'string' &&
    typeof transaction.category === 'number' &&
    typeof transaction.value === 'number' &&
    (transaction.type === 'income' || transaction.type === 'expense') &&
    typeof transaction.date === 'string';
}