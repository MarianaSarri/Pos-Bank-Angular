import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../domain/category';
import { CATEGORIES_REPOSITORY } from '../infrastructure/categories-repository.token';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly repository = inject(CATEGORIES_REPOSITORY);

  getCategories(): Observable<Category[]> {
    return this.repository.getCategories();
  }
}