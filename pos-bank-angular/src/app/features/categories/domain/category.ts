import { TransactionType } from '../../../shared/domain/transaction-type';

export interface Category {
  id: number;
  name: string;
  type: TransactionType.INCOME | TransactionType.EXPENSE;
}