import { createAction, props } from '@ngrx/store';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters } from '../../models/transaction.model';

export const loadTransactions = createAction(
  '[Transactions] Load',
  props<{ page: number; limit: number; filters: TransactionFilters }>()
);
export const loadTransactionsSuccess = createAction(
  '[Transactions] Load Success',
  props<{ response: PaginatedTransactionsResponse }>()
);
export const loadTransactionsFailure = createAction(
  '[Transactions] Load Failure',
  props<{ error: string }>()
);
export const setTransactionFilters = createAction(
  '[Transactions] Set Filters',
  props<{ filters: TransactionFilters }>()
);

export const createTransaction = createAction(
  '[Transactions] Create',
  props<{ transaction: Transaction }>()
);
export const createTransactionSuccess = createAction(
  '[Transactions] Create Success',
  props<{ transaction: Transaction }>()
);
export const createTransactionFailure = createAction(
  '[Transactions] Create Failure',
  props<{ error: string }>()
);

export const updateTransaction = createAction(
  '[Transactions] Update',
  props<{ id: number; transaction: Transaction }>()
);
export const updateTransactionSuccess = createAction(
  '[Transactions] Update Success',
  props<{ transaction: Transaction }>()
);
export const updateTransactionFailure = createAction(
  '[Transactions] Update Failure',
  props<{ error: string }>()
);

export const deleteTransaction = createAction(
  '[Transactions] Delete',
  props<{ id: number }>()
);
export const deleteTransactionSuccess = createAction(
  '[Transactions] Delete Success',
  props<{ id: number }>()
);
export const deleteTransactionFailure = createAction(
  '[Transactions] Delete Failure',
  props<{ error: string }>()
);

export const clearTransactionsState = createAction('[Transactions] Clear State');