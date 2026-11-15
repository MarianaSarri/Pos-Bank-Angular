import { inject, InjectionToken } from '@angular/core';
import { TransactionsRepository } from '../domain/transactions.repository';
import { LocalStorageTransactionsRepository } from './local-storage-transactions.repository';

export const TRANSACTIONS_REPOSITORY = new InjectionToken<TransactionsRepository>(
  'TRANSACTIONS_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => inject(LocalStorageTransactionsRepository)
  }
);