import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, debounceTime, distinctUntilChanged, filter, from, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { getOperationErrorMessage } from '../../core/operation-error-message';
import { TransactionsService } from '../../services/transactions.service';
import {
  createTransaction,
  createTransactionFailure,
  createTransactionSuccess,
  deleteTransaction,
  deleteTransactionFailure,
  deleteTransactionSuccess,
  loadTransactions,
  loadTransactionsFailure,
  loadTransactionsSuccess,
  setTransactionFilters,
  updateTransaction,
  updateTransactionFailure,
  updateTransactionSuccess
} from './transactions.actions';
import { selectTransactionsQuery } from './transactions.selectors';

@Injectable()
export class TransactionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private transactionsService = inject(TransactionsService);

  loadTransactions$ = createEffect(() => this.actions$.pipe(
    ofType(loadTransactions),
    switchMap(({ page, limit, filters }) => this.transactionsService.getTransactions(page, limit, filters).pipe(
      map((response) => loadTransactionsSuccess({ response })),
      catchError((error: unknown) => of(loadTransactionsFailure({ error: getOperationErrorMessage(error) })))
    ))
  ));

  setTransactionFilters$ = createEffect(() => this.actions$.pipe(
    ofType(setTransactionFilters),
    debounceTime(250),
    distinctUntilChanged((previous, current) =>
      previous.filters.search?.trim() === current.filters.search?.trim() &&
      previous.filters.type === current.filters.type
    ),
    withLatestFrom(this.store.select(selectTransactionsQuery)),
    map(([{ filters }, query]) => loadTransactions({ ...query, page: 1, filters }))
  ));

  loadPreviousPageWhenEmpty$ = createEffect(() => this.actions$.pipe(
    ofType(loadTransactionsSuccess),
    filter(({ response }) => response.data.length === 0 && response.page > 1 && response.total > 0),
    withLatestFrom(this.store.select(selectTransactionsQuery)),
    map(([{ response }, query]) => loadTransactions({ ...query, page: response.page - 1 }))
  ));

  createTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(createTransaction),
    concatMap(({ transaction }) => this.transactionsService.addTransaction(transaction).pipe(
      withLatestFrom(this.store.select(selectTransactionsQuery)),
      mergeMap(([created, query]) => from([
        createTransactionSuccess({ transaction: created }),
        loadTransactions({ ...query, page: 1 })
      ])),
      catchError((error: unknown) => of(createTransactionFailure({ error: getOperationErrorMessage(error) })))
    ))
  ));

  updateTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(updateTransaction),
    concatMap(({ id, transaction }) => this.transactionsService.updateTransaction(id, transaction).pipe(
      withLatestFrom(this.store.select(selectTransactionsQuery)),
      mergeMap(([updated, query]) => from([
        updateTransactionSuccess({ transaction: updated }),
        loadTransactions(query)
      ])),
      catchError((error: unknown) => of(updateTransactionFailure({ error: getOperationErrorMessage(error) })))
    ))
  ));

  deleteTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(deleteTransaction),
    concatMap(({ id }) => this.transactionsService.deleteTransaction(id).pipe(
      withLatestFrom(this.store.select(selectTransactionsQuery)),
      mergeMap(([, query]) => from([
        deleteTransactionSuccess({ id }),
        loadTransactions(query)
      ])),
      catchError((error: unknown) => of(deleteTransactionFailure({ error: getOperationErrorMessage(error) })))
    ))
  ));

  refreshDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(createTransactionSuccess, updateTransactionSuccess, deleteTransactionSuccess),
    // The remote dashboard owns its own "transactions" feature and load action.
    map(() => ({ type: '[Transactions] Load Transactions' }))
  ));
}