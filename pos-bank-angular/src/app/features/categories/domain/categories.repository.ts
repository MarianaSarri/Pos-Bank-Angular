import { Observable } from 'rxjs';
import { Category } from './category';

export interface CategoriesRepository {
  getCategories(): Observable<Category[]>;
}