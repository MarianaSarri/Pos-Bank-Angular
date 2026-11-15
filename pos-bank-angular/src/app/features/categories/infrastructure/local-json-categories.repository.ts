import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../domain/category';
import { CategoriesRepository } from '../domain/categories.repository';

@Injectable({ providedIn: 'root' })
export class LocalJsonCategoriesRepository implements CategoriesRepository {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('assets/categories.json').pipe(
      map((categories) => categories ?? [])
    );
  }
}