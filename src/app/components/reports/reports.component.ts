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
import { BaseChartDirective, NgChartsModule } from 'ng2-charts'; // <--- CORREÇÃO: Adicionado NgChartsModule aqui
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule], // <--- CORREÇÃO: Usar NgChartsModule aqui
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

  // Gráfico de Despesas por Categoria (Pizza)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
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
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], any> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
    }]
  };
  public pieChartType = 'pie' as ChartType;

  // Gráfico de Receitas por Categoria (Barra)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0,
        ticks: {
          callback: (value: any) => this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Receitas Totais', backgroundColor: 'rgba(40, 167, 69, 0.7)' },
    ]
  };
  public barChartType = 'bar' as ChartType;

  constructor(
    private reportService: ReportService,
    private categoryService: CategoryService,
    private currencyPipe: CurrencyPipe,
    private authService: AuthService
  ) {
    Chart.register(ChartDataLabels);
  }

  ngOnInit(): void {
    this.loadUserBalance();
    this.loadCategories();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDayOfMonth.toISOString().slice(0, 10);
    this.endDate = today.toISOString().slice(0, 10);
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
        this.barChartData.datasets[0].data = data.map((item: CategoryExpense) => item.totalAmount);
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
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 137.508) % 360;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
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

  getCategoryName(categoryId: number | undefined): string {
    if (categoryId === undefined || categoryId === null) {
        return 'N/A';
    }
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }
}
