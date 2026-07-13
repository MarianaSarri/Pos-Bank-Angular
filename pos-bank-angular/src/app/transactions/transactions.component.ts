import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TransactionsService } from '../services/transactions.service';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@pos-bank/lib-bank';
import { CategoriesService } from '../services/categories.service';
import { Transaction, TransactionType } from '../models/transaction.model';
import { Category } from '../models/categories.model';

export type TransactionFilters = {
  search?: string;
  type?: TransactionType;
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ComponentsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TransactionsComponent implements OnInit, OnDestroy {
  isLoading = false;
  hasError = false;
  public transactions: Transaction[] = [];
  public currentPage = 1;
  public pageSize = 10;
  public totalItems = 0;
  public totalPages = 1;
  public isFirstPage = true;
  public isLastPage = true;
  public shouldRenderTable = false;
  public activeFilters: TransactionFilters = { type: TransactionType.ANY };
  public categories: Category[] = [];

  private destroy$ = new Subject<void>();

  private transactionsService = inject(TransactionsService);
  private categoriesService = inject(CategoriesService);
  private cdr = inject(ChangeDetectorRef);

  constructor(

  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadTransactions();
    this.subscribeToTransactionAdded();
  }

  private subscribeToTransactionAdded() {
    this.transactionsService.onTransactionAdded()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTransactions();
      });
  }

  loadTransactions() {
    this.isLoading = true;
    this.hasError = false;

    this.transactionsService.getTransactions(this.currentPage, this.pageSize, this.activeFilters)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (result) => {
          this.transactions = result.data;
          this.totalItems = result.total;
          this.totalPages = result.totalPages;
          this.isFirstPage = this.currentPage <= 1;
          this.isLastPage = this.currentPage >= this.totalPages;
          this.hasError = false;
          this.shouldRenderTable = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.hasError = true;
        }
      });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadTransactions();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadTransactions();
  }

  onFiltersChange(filters: { search: string; type: TransactionType }) {
    this.activeFilters = {
      search: filters.search,
      type: filters.type,
    };
    this.currentPage = 1;
    this.loadTransactions();
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
    timer(500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadTransactions());
  }

  deleteTransaction(transactionId: number) {
    this.transactionsService.deleteTransaction(transactionId)
    this.transactions = this.transactions.filter(t => t.id !== transactionId);
    this.cdr.detectChanges();
  }

  updateTransaction(transaction: Transaction) {
    const id = transaction.id;
    if (!id) {
      console.error('Transaction ID is required for update.');
      return;
    }
    this.transactionsService.updateTransaction(id, transaction)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.transactions = this.transactions.map(t => {
            if (t.id === id) {
              t = value;
            }
            return t;
          })
          this.cdr.detectChanges();
        },
        error: () => {
          this.hasError = true;
        }
      });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
