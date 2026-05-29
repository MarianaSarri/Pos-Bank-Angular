import { Component, OnDestroy, OnInit } from '@angular/core';
import { TransactionsService } from '../../services/transactions.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  isLoading = true;
  hasError = false;

  private destroy$ = new Subject<void>();

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit() {
    this.transactionsService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
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

  retry() {
    this.isLoading = true;
    this.hasError = false;
    this.transactionsService.getCurrentTransactions();
    this.isLoading = false;
  }
}
