// src/app/models/currency.model.ts
export interface CurrencyApiResponse {
  result: string;
  'base_code': string;
  'conversion_rates': { [key: string]: number };
}
