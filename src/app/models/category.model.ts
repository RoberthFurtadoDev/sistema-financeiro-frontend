// src/app/models/category.model.ts
export interface Category {
  id?: number;
  name: string;
  type: 'RECEITA' | 'DESPESA';
}
