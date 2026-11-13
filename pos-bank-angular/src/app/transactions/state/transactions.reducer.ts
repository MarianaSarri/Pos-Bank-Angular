import { createReducer, on } from '@ngrx/store';
import { PaginatedTransactionsResponse, Transaction, TransactionFilters, TransactionType } from '../../models/transaction.model';
import {
  createTransaction,
  createTransactionFailure,
  createTransactionSuccess,
  clearTransactionsState,
  deleteTransaction,
  deleteTransactionFailure,
  deleteTransactionSuccess,
  loadTransactions,
  loadTransactionsFailure,
  loadTransactionsSuccess,
  updateTransaction,
  updateTransactionFailure,
  updateTransactionSuccess
} from './transactions.actions';

export interface TransactionsState extends PaginatedTransactionsResponse {
  filters: TransactionFilters;
  isLoading: boolean;
  hasLoaded: boolean;
  hasSucceeded: boolean;
  error: string | null;
  mutationError: string | null;
}

export const transactionsFeatureKey = 'transactionList';

const initialState: TransactionsState = {
  data: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  filters: { type: TransactionType.ANY },
  isLoading: false,
  hasLoaded: false,
  hasSucceeded: false,
  error: null,
  mutationError: null
};

export const transactionsReducer = createReducer(
  initialState,
  on(clearTransactionsState, () => initialState),
  on(loadTransactions, (state, { page, limit, filters }) => ({
    ...state,
    page,
    limit,
    filters,
    isLoading: true,
    error: null,
    mutationError: null
  })),
  on(loadTransactionsSuccess, (state, { response }) => ({
    ...state,
    ...response,
    isLoading: false,
    hasLoaded: true,
    hasSucceeded: true,
    error: null
  })),
  on(loadTransactionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    hasLoaded: true,
    error
  })),
  on(createTransaction, updateTransaction, deleteTransaction, (state) => ({
    ...state,
    mutationError: null
  })),
  on(createTransactionSuccess, updateTransactionSuccess, deleteTransactionSuccess, (state) => ({
    ...state,
    mutationError: null
  })),
  on(createTransactionFailure, updateTransactionFailure, deleteTransactionFailure, (state, { error }) => ({
    ...state,
    mutationError: error
  }))
);

export const initialTransactionsState = initialState;
export type TransactionsRecord = Transaction;