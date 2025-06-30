// src/app/components/reports/reports.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { CategoryService } from '../../services/category.service';
import { Balance } from '../../models/balance.model';
import { Transaction } from '../../models/transaction.model';
import { Category } from '../../models/category.model';
import { CategoryExpense } from '../../models/category-expense.model';
import { HttpErrorResponse } from '@angular/common/http';

// Importações para gráficos
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  userBalance: Balance | null = null;
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];

  startDate: string = '';
  endDate: string = '';
  selectedCategoryId: number | 'all' = 'all';

  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  // --- PROPRIEDADES PARA GRÁFICOS ---
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
            font: { size: 12, family: 'var(--font-family-base)' },
            color: 'var(--text-color-body)'
        }
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          if (ctx.chart.data.labels) {
            let labels = ctx.chart.data.labels[ctx.dataIndex];
            while (Array.isArray(labels) && labels.length > 0 && typeof labels[0] !== 'string') {
                labels = labels[0];
            }
            return Array.isArray(labels) ? labels.join(' ') : labels;
          }
          return '';
        },
        color: 'white',
        font: { weight: 'bold', size: 11 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyFont: { size: 14, family: 'var(--font-family-base)' },
        titleFont: { size: 14, family: 'var(--font-family-base)', weight: 'bold' },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const currencyPipeInstance = (context.chart.options.plugins as any)?.tooltip?.customCurrencyPipe;
            return `${label}: ${currencyPipeInstance?.transform(value, 'BRL', 'symbol', '1.2-2')}`;
          }
        },
        componentInstance: null as any
      } as any
    } as any
  };
  public pieChartData: ChartData<'pie', number[], any> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 10
    }]
  };
  public pieChartType: 'pie' = 'pie';

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { font: { size: 12, family: 'var(--font-family-base)' }, color: 'var(--text-color-body)' },
        grid: { display: false }
      },
      y: {
        min: 0,
        ticks: {
          callback: (value: any) => this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2'),
          font: { size: 12, family: 'var(--font-family-base)' },
          color: 'var(--text-color-body)'
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyFont: { size: 14, family: 'var(--font-family-base)' },
        titleFont: { size: 14, family: 'var(--font-family-base)', weight: 'bold' },
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            const currencyPipeInstance = (context.chart.options.plugins as any)?.tooltip?.customCurrencyPipe;
            return `${label}: ${currencyPipeInstance?.transform(value, 'BRL', 'symbol', '1.2-2')}`;
          }
        },
        componentInstance: null as any
      } as any,
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: 'var(--text-color-heading)',
        font: { weight: 'bold', size: 12 },
        formatter: (value: number) => this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')
      }
    } as any
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Receitas Totais' },
    ]
  };
  public barChartType: 'bar' = 'bar';

  constructor(
    private reportService: ReportService,
    private categoryService: CategoryService,
    private currencyPipe: CurrencyPipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.pieChartOptions.plugins) { this.pieChartOptions.plugins = {}; }
    if (!(this.pieChartOptions.plugins as any).tooltip) { (this.pieChartOptions.plugins as any).tooltip = {}; }
    (this.pieChartOptions.plugins as any).tooltip.customCurrencyPipe = this.currencyPipe;

    if (!this.barChartOptions.plugins) { this.barChartOptions.plugins = {}; }
    if (!(this.barChartOptions.plugins as any).tooltip) { (this.barChartOptions.plugins as any).tooltip = {}; }
    (this.barChartOptions.plugins as any).tooltip.customCurrencyPipe = this.currencyPipe;

    this.loadUserBalance();
    this.loadCategories();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDayOfMonth = today.toISOString().slice(0, 10);
    this.startDate = firstDayOfMonth;
    this.endDate = lastDayOfMonth;
    this.filterTransactions();
    this.loadExpenseChartData();
    this.loadIncomeChartData();
  }

  loadUserBalance(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.reportService.getUserBalance().subscribe({
      next: (data: Balance) => {
        this.userBalance = data;
        this.isLoading = false;
        this.message = 'Balanço carregado com sucesso.';
        this.clearMessageAfterDelay();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleError(err, 'carregar balanço');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        if (this.categories.length === 0) {
          this.message = 'Nenhuma categoria cadastrada. Cadastre categorias para filtrar transações.';
          this.isError = true;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar categorias para filtros:', err);
        this.message = 'Erro ao carregar categorias. Os filtros de categoria podem não funcionar.';
        this.isError = true;
      }
    });
  }

  filterTransactions(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    if (this.selectedCategoryId === 'all') {
      if (!this.startDate || !this.endDate) {
        this.isLoading = false;
        this.isError = true;
        this.message = 'Preencha as datas de início e fim para filtrar por período.';
        return;
      }
      this.reportService.getTransactionsByPeriod(this.startDate, this.endDate).subscribe({
        next: (data: Transaction[]) => {
          this.filteredTransactions = data;
          this.isLoading = false;
          this.isError = false;
          if (data.length === 0) {
            this.message = 'Nenhuma transação encontrada para o período selecionado.';
            this.isError = false;
          } else {
            this.message = 'Transações filtradas com sucesso por período.';
            this.clearMessageAfterDelay();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.handleError(err, 'filtrar transações por período');
        }
      });
    } else {
      if (this.selectedCategoryId === 0 || this.selectedCategoryId === undefined || this.selectedCategoryId === null) {
          this.isLoading = false;
          this.isError = true;
          this.message = 'Por favor, selecione uma categoria válida para filtrar.';
          return;
      }
      this.reportService.getTransactionsByCategory(this.selectedCategoryId as number).subscribe({
        next: (data: Transaction[]) => {
          this.filteredTransactions = data;
          this.isLoading = false;
          this.isError = false;
          if (data.length === 0) {
            this.message = 'Nenhuma transação encontrada para a categoria selecionada.';
            this.isError = false;
          } else {
            this.message = 'Transações filtradas com sucesso por categoria.';
            this.clearMessageAfterDelay();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.handleError(err, 'filtrar transações por categoria');
        }
      });
    }
  }

  loadExpenseChartData(): void {
    const username = this.authService.getUsernameFromToken();
    if (!username) {
        console.warn('Usuário não autenticado para carregar dados do gráfico de despesas.');
        return;
    }
    this.reportService.getTotalExpensesByCategory().subscribe({
      next: (data: CategoryExpense[]) => {
        this.pieChartData.labels = data.map((item: CategoryExpense) => item.categoryName) as any;
        this.pieChartData.datasets[0].data = data.map((item: CategoryExpense) => item.totalAmount);
        this.pieChartData.datasets[0].backgroundColor = this.generateRandomColors(data.length);
        if (this.chart) {
          this.chart.update();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar dados do gráfico de despesas:', err);
      }
    });
  }

  loadIncomeChartData(): void {
    const username = this.authService.getUsernameFromToken();
    if (!username) {
        console.warn('Usuário não autenticado para carregar dados do gráfico de receitas.');
        return;
    }
    this.reportService.getTotalIncomesByCategory().subscribe({
      next: (data: CategoryExpense[]) => {
        this.barChartData.labels = data.map((item: CategoryExpense) => item.categoryName);
        const dataset = this.barChartData.datasets[0];
        dataset.data = data.map((item: CategoryExpense) => item.totalAmount);
        dataset.backgroundColor = this.generateRandomColors(data.length);

        if (this.chart) {
          this.chart.update();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar dados do gráfico de receitas:', err);
      }
    });
  }

  private generateRandomColors(numColors: number): string[] {
    const colors = [];
    const granatumColors = [
        '#0097D7', // Azul principal
        '#16d136', // Seu verde
        '#FFAE2E', // Laranja do Granatum
        '#E32067', // Rosa/Magenta
        '#9747FF', // Roxo
        '#00D6E2', // Ciano
        '#DBFF00', // Verde-limão
        '#FF5388'  // Outro tom de rosa
    ];
    for (let i = 0; i < numColors; i++) {
        colors.push(granatumColors[i % granatumColors.length]);
    }
    return colors;
  }

  private handleError(err: HttpErrorResponse, operation: string): void {
    this.isError = true;
    console.error(`Erro ao ${operation}:`, err);
    let errorMessage = `Erro desconhecido ao ${operation}.`;
    if (err.error && typeof err.error === 'object' && err.error.message) { errorMessage = err.error.message; }
    else if (err.message) { errorMessage = err.message; }
    else if (err.status === 0) { errorMessage = `Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está online.`; }
    this.message = `Erro ao ${operation}: ${errorMessage}`;
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => { this.message = ''; this.isError = false; }, 5000);
  }

  getCategoryName(categoryId: number | undefined): string {
    if (categoryId === undefined || categoryId === null) { return 'N/A'; }
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }
}
