import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  cardData: any[] = [];
  isLoading = true;
  hasError = false;
  private destroy$ = new Subject<void>();
  private currencyFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit() {
    this.transactionsService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.updateCardData(transactions);
          this.hasError = false;
          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCardData(transactions: Transaction[]) {
    const totalCredit = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalDebt = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.value), 0);

    const balance = totalCredit - totalDebt;

    this.cardData = [
      {
        title: 'Saldo Atual',
        amount: this.currencyFormatter.format(balance),
        valueColor: 'var(--text-strong)',
      },
      {
        title: 'Débito',
        amount: this.currencyFormatter.format(totalDebt),
        valueColor: 'var(--color-debt)',
      },
      {
        title: 'Crédito',
        amount: this.currencyFormatter.format(totalCredit),
        valueColor: 'var(--color-credit)',
      },
    ];
  }

  retry() {
    this.isLoading = true;
    this.hasError = false;

    const transactions = this.transactionsService.getCurrentTransactions();
    this.updateCardData(transactions);
    this.isLoading = false;
  }
}
