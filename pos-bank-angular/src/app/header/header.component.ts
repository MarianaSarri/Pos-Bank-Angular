import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@pos-bank/lib-bank';
import { Transaction, TransactionType } from '../models/transaction.model';
import { CategoriesService } from '../services/categories.service';
import { CategoriesResult } from '../models/categories.model';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { map, take, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { clearTransactionsState, createTransaction, createTransactionFailure, createTransactionSuccess } from '../transactions/state/transactions.actions';
import { AuthService } from '../core/auth.service';
import { getApiErrorMessage } from '../core/api-error-message';

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [CommonModule, ComponentsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isModalOpen = false;
  authError = '';
  categoriesError = '';
  categoriesLoading = false;
  private store = inject(Store);
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private user = toSignal(this.authService.user$, { initialValue: null });
  private router = inject(Router);
  private categoriesService = inject(CategoriesService);
  categoriesResult: CategoriesResult = { categoriesExpense: [], categoriesIncome: [] };
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadCategories();
  }

  get isAuthenticated() {
    return this.user() !== null;
  }

  controlModal(control: boolean) {
    this.isModalOpen = control;
  }

  handleAddTransaction(input: Transaction) {
    this.actions$.pipe(
      ofType(createTransactionSuccess, createTransactionFailure),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      if (action.type === createTransactionSuccess.type) {
        this.controlModal(false);
      }
    });
    this.store.dispatch(createTransaction({ transaction: input }));
  }

  async logout() {
    this.authError = '';
    try {
      await this.authService.signOut();
      this.store.dispatch(clearTransactionsState());
      await this.router.navigateByUrl('/login');
    } catch {
      this.authError = 'Nao foi possivel encerrar a sessao. Tente novamente.';
    }
  }

  retryCategories() {
    this.loadCategories();
  }

  private loadCategories() {
    if (this.categoriesLoading) return;
    this.categoriesLoading = true;

    this.categoriesService.getCategories().pipe(
      map((categories) => {
        return {
          categoriesExpense: categories.filter((category) => category.type === TransactionType.EXPENSE),
          categoriesIncome: categories.filter((category) => category.type === TransactionType.INCOME),
        };
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.categoriesResult = result;
        this.categoriesError = '';
        this.categoriesLoading = false;
      },
      error: (error: unknown) => {
        this.categoriesError = getApiErrorMessage(error);
        this.categoriesLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

