import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { TransactionType } from '../models/transaction.model';
import { CategoriesService } from '../services/categories.service';
import { createTransactionFailure, createTransactionSuccess } from '../transactions/state/transactions.actions';
import { HeaderComponent } from './header.component';

describe('HeaderComponent transaction errors', () => {
  it('shows a creation failure and clears it on a new attempt', () => {
    const actions = new Subject<Action>();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Actions, useValue: new Actions(actions) },
        { provide: Store, useValue: { dispatch: () => {} } },
        { provide: AuthService, useValue: { user$: of(null) } },
        { provide: CategoriesService, useValue: { getCategories: () => of([]) } }
      ]
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const transaction = {
      description: 'Despesa',
      category: 1,
      value: -5,
      type: TransactionType.EXPENSE,
      date: '2026-11-11'
    };

    fixture.componentInstance.handleAddTransaction(transaction);
    actions.next(createTransactionFailure({ error: 'Nao foi possivel salvar.' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nao foi possivel salvar.');

    fixture.componentInstance.handleAddTransaction(transaction);
    actions.next(createTransactionSuccess({ transaction }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Nao foi possivel salvar.');
  });
});
