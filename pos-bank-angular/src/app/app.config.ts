import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withPreloading } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { TransactionsEffects } from './transactions/state/transactions.effects';
import { transactionsReducer } from './transactions/state/transactions.reducer';
import { SelectivePreloadingStrategy } from './core/selective-preloading.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withEnabledBlockingInitialNavigation(), withPreloading(SelectivePreloadingStrategy)),
    provideStore(),
    provideState('transactions', transactionsReducer),
    provideEffects(TransactionsEffects),
  ]
};
