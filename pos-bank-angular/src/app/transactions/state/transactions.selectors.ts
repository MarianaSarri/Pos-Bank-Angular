import { createFeatureSelector, createSelector } from '@ngrx/store';
import { transactionsFeatureKey, TransactionsState } from './transactions.reducer';

export const selectTransactionsState = createFeatureSelector<TransactionsState>(transactionsFeatureKey);

export const selectTransactionsViewModel = createSelector(
  selectTransactionsState,
  (state) => state
);

export const selectTransactionsQuery = createSelector(
  selectTransactionsState,
  ({ page, limit, filters }) => ({ page, limit, filters })
);