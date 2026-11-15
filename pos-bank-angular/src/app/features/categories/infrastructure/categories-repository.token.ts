import { inject, InjectionToken } from '@angular/core';
import { CategoriesRepository } from '../domain/categories.repository';
import { LocalJsonCategoriesRepository } from './local-json-categories.repository';

export const CATEGORIES_REPOSITORY = new InjectionToken<CategoriesRepository>(
  'CATEGORIES_REPOSITORY',
  {
    providedIn: 'root',
    factory: () => inject(LocalJsonCategoriesRepository)
  }
);