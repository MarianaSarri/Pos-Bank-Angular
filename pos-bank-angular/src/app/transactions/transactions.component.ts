import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@pos-bank/lib-bank';
import { CategoriesService } from '../services/categories.service';
import { Transaction, TransactionType } from '../models/transaction.model';
import { Category } from '../models/categories.model';
import { deleteTransaction as deleteTransactionAction, loadTransactions as loadTransactionsAction, setTransactionFilters, updateTransaction as updateTransactionAction } from './state/transactions.actions';
import { selectTransactionsQuery, selectTransactionsViewModel } from './state/transactions.selectors';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ComponentsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public categories: Category[] = [];

  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private categoriesService = inject(CategoriesService);
  private cdr = inject(ChangeDetectorRef);
  private viewModel = this.store.selectSignal(selectTransactionsViewModel);
  private query = this.store.selectSignal(selectTransactionsQuery);

  get isLoading() { return this.viewModel().isLoading; }
  get loadError() { return this.viewModel().error; }
  get mutationError() { return this.viewModel().mutationError; }
  get transactions() { return this.viewModel().data; }
  get currentPage() { return this.viewModel().page; }
  get pageSize() { return this.viewModel().limit; }
  get totalItems() { return this.viewModel().total; }
  get totalPages() { return this.viewModel().totalPages; }
  get isFirstPage() { return this.currentPage <= 1; }
  get isLastPage() { return this.currentPage >= this.totalPages; }
  get hasSucceeded() { return this.viewModel().hasSucceeded; }
  get isInitialLoading() { return this.isLoading && !this.hasSucceeded; }
  get shouldRenderTable() { return this.hasSucceeded; }

  constructor(

  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadTransactions();
  }

  loadTransactions() {
    this.store.dispatch(loadTransactionsAction(this.query()));
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.store.dispatch(loadTransactionsAction({ ...this.query(), page }));
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.store.dispatch(loadTransactionsAction({
      ...this.query(),
      page: event.pageIndex,
      limit: event.pageSize
    }));
  }

  onFiltersChange(filters: { search: string; type: TransactionType }) {
    this.store.dispatch(setTransactionFilters({ filters }));
  }

  private loadCategories(): void {
    this.categoriesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categoriesResult) => {
        this.categories = categoriesResult;
        this.cdr.detectChanges();
      });
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  retry() {
    this.loadTransactions();
  }

  deleteTransaction(transactionId: number) {
    this.store.dispatch(deleteTransactionAction({ id: transactionId }));
  }

  updateTransaction(transaction: Transaction) {
    const id = transaction.id;
    if (!id) {
      console.error('Transaction ID is required for update.');
      return;
    }
    this.store.dispatch(updateTransactionAction({ id, transaction }));
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
