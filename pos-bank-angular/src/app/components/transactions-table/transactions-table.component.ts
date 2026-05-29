import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TransactionsService } from '../../services/transactions.service';
import { CategoriesService } from '../../services/categories.service';
import { Transaction, TransactionInput } from '../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transactions-table',
  standalone: false,
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.css',
})
export class TransactionsTableComponent implements OnInit, OnDestroy {
  @Input() limit?: number;
  @Input() showActions = true;

  transactions: Transaction[] = [];
  visible: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  transactionToDelete: Transaction | null = null;

  private destroy$ = new Subject<void>();
  private currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

  private categoryColors: Record<number, string> = {
    1: 'badge rounded-pill bg-primary-subtle text-primary',
    2: 'badge rounded-pill bg-success-subtle text-success',
    3: 'badge rounded-pill bg-info-subtle text-info-emphasis',
    4: 'badge rounded-pill bg-warning-subtle text-warning-emphasis',
  };

  constructor(
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.transactionsService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
        this.updateVisible();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateVisible() {
    this.visible = typeof this.limit === 'number' ? this.transactions.slice(0, this.limit) : this.transactions;
  }

  getCategoryName(transaction: Transaction): string | undefined {
    return this.categoriesService.getCategoryName(transaction.category, transaction.type);
  }

  getCategoryColor(category: number): string {
    return this.categoryColors[category] ?? 'badge rounded-pill bg-secondary-subtle text-secondary';
  }

  formatDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    return isNaN(parsed.getTime()) ? date : this.dateFormatter.format(parsed);
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  absValue(value: number): number {
    return Math.abs(value);
  }

  selectTransaction(transaction: Transaction) {
    this.selectedTransaction = transaction;
  }

  deselectTransaction() {
    this.selectedTransaction = null;
  }

  handleUpdate(input: TransactionInput) {
    if (!this.selectedTransaction) return;
    this.transactionsService.updateTransaction(this.selectedTransaction.id, input);
    this.deselectTransaction();
  }

  markForDelete(transaction: Transaction) {
    this.transactionToDelete = transaction;
  }

  handleDelete() {
    if (!this.transactionToDelete) return;
    this.transactionsService.deleteTransaction(this.transactionToDelete.id);
    if (this.selectedTransaction?.id === this.transactionToDelete.id) {
      this.deselectTransaction();
    }
    this.transactionToDelete = null;
  }
}
