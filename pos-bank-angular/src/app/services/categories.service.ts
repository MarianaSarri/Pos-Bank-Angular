import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Category } from '../models/categories.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient);
  constructor() {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('assets/categories.json');
  }
}
