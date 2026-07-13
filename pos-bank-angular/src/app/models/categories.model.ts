import { TransactionType } from "./transaction.model";

export type Category = {
  id: number;
  name: string;
  type: TransactionType;
};

export type CategoriesResult = {
  categoriesExpense: Category[];
  categoriesIncome: Category[];
};