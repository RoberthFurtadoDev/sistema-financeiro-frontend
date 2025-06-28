// src/app/models/transaction.model.ts
export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  type: 'RECEITA' | 'DESPESA';

  categoryName?: string;
}
