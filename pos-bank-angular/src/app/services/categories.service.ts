import { Injectable } from '@angular/core';
import { Category, CategoriesResult } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private categories: CategoriesResult = {
    categoriesExpense: [
      { id: 1, name: 'Alimentação' },
      { id: 2, name: 'Receita' },
      { id: 3, name: 'Saúde' },
      { id: 4, name: 'Contas' },
    ],
    categoriesIncome: [
      { id: 1, name: 'Salário' },
      { id: 2, name: 'Bônus' },
      { id: 3, name: 'Investimentos' },
    ],
  };

  constructor() {}

  getCategories(): CategoriesResult {
    return this.categories;
  }

  getCategoryName(categoryId: number, type: 'income' | 'expense'): string | undefined {
    const list = type === 'income' ? this.categories.categoriesIncome : this.categories.categoriesExpense;
    return list.find(c => c.id === categoryId)?.name;
  }
}
