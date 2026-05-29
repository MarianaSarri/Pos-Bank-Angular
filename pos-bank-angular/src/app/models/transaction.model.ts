export type Transaction = {
  id: number;
  description: string;
  category: number;
  value: number;
  date: string;
  type: 'income' | 'expense';
};

export type TransactionInput = {
  description: string;
  category: number;
  value: number;
  type: 'income' | 'expense';
  date: string;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoriesResult = {
  categoriesExpense: Category[];
  categoriesIncome: Category[];
};
