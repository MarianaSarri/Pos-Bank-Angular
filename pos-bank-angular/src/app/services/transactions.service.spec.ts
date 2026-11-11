import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TransactionsService] });
    service = TestBed.inject(TransactionsService);
    storage = TestBed.inject(DOCUMENT).defaultView!.localStorage;
    storage.removeItem('pos-bank-transactions');
  });

  afterEach(() => storage.removeItem('pos-bank-transactions'));

  it('persists transactions and supports filtering, pagination, updates, and deletion', async () => {
    const first = await firstValueFrom(service.addTransaction(makeTransaction('Mercado', TransactionType.EXPENSE)));
    await firstValueFrom(service.addTransaction(makeTransaction('Salario', TransactionType.INCOME)));
    await firstValueFrom(service.addTransaction(makeTransaction('Farmacia', TransactionType.EXPENSE)));

    expect(first.id).toBe(1);
    expect((await firstValueFrom(service.getTransactions(1, 1))).data[0].description).toBe('Farmacia');

    const filtered = await firstValueFrom(service.getTransactions(1, 10, {
      search: 'a',
      type: TransactionType.EXPENSE
    }));
    expect(filtered.data.map(({ description }) => description)).toEqual(['Farmacia', 'Mercado']);

    const updated = await firstValueFrom(service.updateTransaction(first.id!, {
      ...first,
      description: 'Supermercado'
    }));
    expect(updated.description).toBe('Supermercado');

    await firstValueFrom(service.deleteTransaction(first.id!));
    const remaining = await firstValueFrom(service.getTransactions());
    expect(remaining.data.map(({ description }) => description)).toEqual(['Farmacia', 'Salario']);
    expect(remaining.total).toBe(2);
  });

  it('reports corrupt stored transaction data instead of silently discarding it', async () => {
    storage.setItem('pos-bank-transactions', '{invalid json');

    await expect(firstValueFrom(service.getTransactions()))
      .rejects.toThrow('Os dados locais das transacoes estao corrompidos.');
  });

  function makeTransaction(description: string, type: TransactionType): Transaction {
    return {
      description,
      category: 1,
      value: 10,
      type,
      date: '2026-11-11'
    };
  }
});
