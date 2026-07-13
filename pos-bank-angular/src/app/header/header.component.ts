import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@pos-bank/lib-bank';
import { TransactionsService } from '../services/transactions.service';
import { Transaction, TransactionType } from '../models/transaction.model';
import { CategoriesService } from '../services/categories.service';
import { CategoriesResult } from '../models/categories.model';
import { map, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [CommonModule, ComponentsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isModalOpen = false;
  private transactionService = inject(TransactionsService);
  private categoriesService = inject(CategoriesService);
  categoriesResult: CategoriesResult = { categoriesExpense: [], categoriesIncome: [] };
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadCategories();
  }

  controlModal(control: boolean) {
    this.isModalOpen = control;
  }

  handleAddTransaction(input: Transaction) {
    this.transactionService.addTransaction(input).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.controlModal(false);
    });
  }

  private loadCategories() {
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
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

