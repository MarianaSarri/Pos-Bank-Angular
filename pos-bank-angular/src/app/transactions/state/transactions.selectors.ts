import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionsState } from './transactions.reducer';

export const selectTransactionsState = createFeatureSelector<TransactionsState>('transactions');

export const selectTransactionsViewModel = createSelector(
  selectTransactionsState,
  (state) => state
);

export const selectTransactionsQuery = createSelector(
  selectTransactionsState,
  ({ page, limit, filters }) => ({ page, limit, filters })
);