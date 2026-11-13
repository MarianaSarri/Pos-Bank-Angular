import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, createEffect, ofType, provideEffects } from '@ngrx/effects';
import { createAction, createFeatureSelector, createReducer, on, props, provideState, provideStore, Store } from '@ngrx/store';
import { catchError, firstValueFrom, map, of, switchMap } from 'rxjs';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { TransactionsService } from '../../services/transactions.service';
import { createTransaction, deleteTransaction, loadTransactions, updateTransaction } from './transactions.actions';
import { TransactionsEffects } from './transactions.effects';
import { transactionsFeatureKey, transactionsReducer } from './transactions.reducer';
import { selectTransactionsViewModel } from './transactions.selectors';

const dashboardLoad = createAction('[Transactions] Load Transactions');
const dashboardLoadSuccess = createAction(
  '[Transactions] Load Transactions Success',
  props<{ transactions: Transaction[] }>()
);
const dashboardLoadFailure = createAction(
  '[Transactions] Load Transactions Failure',
  props<{ error: string }>()
);

const dashboardReducer = createReducer(
  { transactions: [] as Transaction[], loading: false, error: null as string | null },
  on(dashboardLoad, (state) => ({ ...state, loading: true, error: null })),
  on(dashboardLoadSuccess, (state, { transactions }) => ({ ...state, transactions, loading: false })),
  on(dashboardLoadFailure, (state, { error }) => ({ ...state, error, loading: false }))
);
const selectDashboard = createFeatureSelector<ReturnType<typeof dashboardReducer>>('transactions');

@Injectable()
class DashboardContractEffects {
  private actions$ = inject(Actions);
  private service = inject(TransactionsService);

  load$ = createEffect(() => this.actions$.pipe(
    ofType(dashboardLoad),
    switchMap(() => this.service.getTransactions(1, Number.MAX_SAFE_INTEGER).pipe(
      map(({ data }) => dashboardLoadSuccess({ transactions: data })),
      catchError((error: Error) => of(dashboardLoadFailure({ error: error.message })))
    ))
  ));
}

describe('transactions and dashboard integration', () => {
  let store: Store;
  let service: TransactionsService;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(transactionsFeatureKey, transactionsReducer),
        provideState('transactions', dashboardReducer),
        provideEffects(TransactionsEffects, DashboardContractEffects)
      ]
    });
    store = TestBed.inject(Store);
    service = TestBed.inject(TransactionsService);
    storage = TestBed.inject(DOCUMENT).defaultView!.localStorage;
    storage.removeItem('pos-bank-transactions');
  });

  afterEach(() => storage.removeItem('pos-bank-transactions'));

  it('keeps the paginated list separate and refreshes the complete dashboard after mutations', async () => {
    for (let index = 0; index < 12; index++) {
      await firstValueFrom(service.addTransaction(transaction(`Receita ${index}`, 10, TransactionType.INCOME)));
    }
    store.dispatch(dashboardLoad());
    store.dispatch(loadTransactions({ page: 1, limit: 2, filters: { type: TransactionType.INCOME } }));

    store.dispatch(createTransaction({ transaction: transaction('Despesa', -5, TransactionType.EXPENSE) }));
    let dashboard = await firstValueFrom(store.select(selectDashboard));
    let list = await firstValueFrom(store.select(selectTransactionsViewModel));
    expect(dashboard.transactions).toHaveLength(13);
    expect(dashboard.transactions.reduce((sum, item) => sum + item.value, 0)).toBe(115);
    expect(list.data).toHaveLength(2);
    expect(list.total).toBe(12);
    expect(list.filters.type).toBe(TransactionType.INCOME);

    const created = dashboard.transactions[0];
    store.dispatch(updateTransaction({ id: created.id!, transaction: { ...created, value: -20 } }));
    dashboard = await firstValueFrom(store.select(selectDashboard));
    expect(dashboard.transactions[0].value).toBe(-20);

    store.dispatch(deleteTransaction({ id: created.id! }));
    dashboard = await firstValueFrom(store.select(selectDashboard));
    list = await firstValueFrom(store.select(selectTransactionsViewModel));
    expect(dashboard.transactions).toHaveLength(12);
    expect(list.total).toBe(12);
  });

  it('reports a creation error without refreshing the dashboard', async () => {
    storage.setItem('pos-bank-transactions', '{invalid json');
    store.dispatch(createTransaction({ transaction: transaction('Despesa', -5, TransactionType.EXPENSE) }));

    const list = await firstValueFrom(store.select(selectTransactionsViewModel));
    const dashboard = await firstValueFrom(store.select(selectDashboard));
    expect(list.mutationError).toContain('corrompidos');
    expect(dashboard.error).toBeNull();
  });

  function transaction(description: string, value: number, type: TransactionType): Transaction {
    return { description, category: 1, value, type, date: '2026-11-11' };
  }
});
