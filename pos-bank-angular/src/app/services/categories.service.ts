import { inject, Injectable } from '@angular/core';
import { environment } from '../../env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { CategoriesResult, Category } from '../models/categories.model';
import { TransactionType } from "../models/transaction.model";
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient);
  constructor() {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.apiUrl + '/category').pipe
    (map((categories: Category[]) => {
      return categories ?? [];
    }))
  }
}
