export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  ANY = 'all'
}

export type Category = {
  id: number;
  name: string;
  type: TransactionType;
};

export type AttachmentType = 'pdf' | 'png';

export interface Attachment {
  name: string;
  type: AttachmentType;
  size: number;
}

export interface Transaction {
  id?: number;
  description: string;
  category: number;
  value: number;
  type: TransactionType;
  date: string;
  attachments?: Attachment[];
}

export type TransactionFilters = {
  search?: string;
  type?: TransactionType | 'all';
};

export type PaginatedTransactionsResponse = {
  data: Transaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};