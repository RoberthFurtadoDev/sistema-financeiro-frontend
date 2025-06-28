// src/app/components/currency/currency.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { CurrencyApiResponse } from '../../models/currency.model'; // <--- CORREÇÃO: Importa a interface CurrencyApiResponse
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css']
})
export class CurrencyComponent implements OnInit {
  availableCurrencies: string[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

  baseCurrency: string = 'BRL';
  targetCurrency: string = 'USD';
  amountToConvert: number = 1;
  convertedAmount: number | null = null;
  conversionRate: number | null = null;

  allRates: { [key: string]: number } | null = null;

  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.getRates();
  }

  getRates(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;
    this.convertedAmount = null;
    this.conversionRate = null;

    this.currencyService.getLatestRates(this.baseCurrency).subscribe({
      next: (data: CurrencyApiResponse) => { // <--- CORREÇÃO: Tipagem para data
        this.isLoading = false;
        if (data.result === 'success') {
          this.allRates = data.conversion_rates;
          this.message = `Taxas para ${this.baseCurrency} carregadas com sucesso.`;
          this.isError = false;
          this.performConversion();
          this.clearMessageAfterDelay();
        } else {
          this.isError = true;
          this.message = `Erro ao obter taxas: ${data.result}. Verifique a moeda base.`;
        }
      },
      error: (err: HttpErrorResponse) => { // <--- CORREÇÃO: Tipagem para err
        this.isLoading = false;
        this.handleError(err, 'obter taxas de câmbio');
      }
    });
  }

  performConversion(): void {
    if (this.allRates && this.targetCurrency && this.amountToConvert !== null) {
      const rate = this.allRates[this.targetCurrency];
      if (rate) {
        this.conversionRate = rate;
        this.convertedAmount = this.amountToConvert * rate;
        this.message = '';
        this.isError = false;
      } else {
        this.convertedAmount = null;
        this.conversionRate = null;
        this.message = `Não foi encontrada taxa de conversão para ${this.targetCurrency}.`;
        this.isError = true;
      }
    }
  }

  private handleError(err: HttpErrorResponse, operation: string): void {
    this.isError = true;
    console.error(`Erro ao ${operation}:`, err);

    let errorMessage = `Erro desconhecido ao ${operation}.`;
    if (err.error && typeof err.error === 'object' && err.error.message) {
        errorMessage = err.error.message;
    } else if (err.message) {
        errorMessage = err.message;
    } else if (err.status === 0) {
        errorMessage = `Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está online.`;
    }

    this.message = `Erro ao ${operation}: ${errorMessage}`;
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 5000);
  }
}
