// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { Balance } from '../../models/balance.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryExpense } from '../../models/category-expense.model';

// Importações para gráficos (completas, como em reports.component.ts)
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule],
  providers: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userBalance: number | null = null;
  monthlyIncomes: number | null = null;
  monthlyExpenses: number | null = null;
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  // --- PROPRIEDADES DOS GRÁFICOS (REUTILIZADAS DO REPORTS.COMPONENT.TS) ---
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
            return Array.isArray(labels) ? labels.join(' ') : labels;
          }
          return '';
        },
        color: 'white',
        font: { weight: 'bold', size: 11 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const currencyPipeInstance = (context.chart.options.plugins as any)?.tooltip?.customCurrencyPipe;
            return `${label}: ${currencyPipeInstance?.transform(value, 'BRL', 'symbol', '1.2-2')}`;
          }
        }
      } as any
    }
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
      y: {
        min: 0,
        ticks: {
          callback: (value: any) => this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2'),
          font: { size: 12, family: 'var(--font-family-base)' },
          color: 'var(--text-color-body)'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            const currencyPipeInstance = (context.chart.options.plugins as any)?.tooltip?.customCurrencyPipe;
            return `${label}: ${currencyPipeInstance?.transform(value, 'BRL', 'symbol', '1.2-2')}`;
          }
        }
      } as any
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Receitas Totais' }]
  };
  public barChartType: 'bar' = 'bar';
  // --- FIM DAS PROPRIEDADES DOS GRÁFICOS ---

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportService: ReportService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    const usernameFromToken = this.authService.getUsernameFromToken();
    this.username = usernameFromToken ? usernameFromToken : 'Usuário';

    // Injetar o CurrencyPipe nas opções do gráfico para os tooltips
    if (this.pieChartOptions.plugins?.tooltip) {
        (this.pieChartOptions.plugins.tooltip as any).customCurrencyPipe = this.currencyPipe;
    }
    if (this.barChartOptions.plugins?.tooltip) {
        (this.barChartOptions.plugins.tooltip as any).customCurrencyPipe = this.currencyPipe;
    }

    this.loadFinancialSummaries();
    this.loadExpenseChartData();
    this.loadIncomeChartData();
  }

  loadFinancialSummaries(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.reportService.getUserBalance().subscribe({
      next: (data: Balance) => { this.userBalance = data.balance; },
      error: (err) => this.handleError(err, 'carregar balanço')
    });

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    this.reportService.getTransactionsByPeriod(firstDay, lastDay).subscribe({
      next: (transactions) => {
        this.monthlyIncomes = transactions
          .filter(t => t.type === 'RECEITA')
          .reduce((sum, t) => sum + t.amount, 0);
        this.monthlyExpenses = transactions
          .filter(t => t.type === 'DESPESA')
          .reduce((sum, t) => sum + t.amount, 0);
        this.isLoading = false;
      },
      error: (err) => this.handleError(err, 'carregar resumos mensais')
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // --- MÉTODOS DOS GRÁFICOS (REUTILIZADOS DO REPORTS.COMPONENT.TS) ---
  loadExpenseChartData(): void {
    this.reportService.getTotalExpensesByCategory().subscribe({
      next: (data: CategoryExpense[]) => {
        this.pieChartData.labels = data.map(item => item.categoryName);
        this.pieChartData.datasets[0].data = data.map(item => item.totalAmount);
        this.pieChartData.datasets[0].backgroundColor = this.generatePalettedColors(data.length);
        this.chart?.update();
      },
      error: (err) => this.handleError(err, 'carregar gráfico de despesas')
    });
  }

  loadIncomeChartData(): void {
    this.reportService.getTotalIncomesByCategory().subscribe({
      next: (data: CategoryExpense[]) => {
        this.barChartData.labels = data.map(item => item.categoryName);
        const dataset = this.barChartData.datasets[0];
        dataset.data = data.map(item => item.totalAmount);
        dataset.backgroundColor = this.generatePalettedColors(data.length);
        this.chart?.update();
      },
      error: (err) => this.handleError(err, 'carregar gráfico de receitas')
    });
  }

  private generatePalettedColors(numColors: number): string[] {
    const colors = [];
    // Paleta de cores consistente com a do reports.component.ts
    const granatumColors = [
        '#0097D7', '#16d136', '#FFAE2E', '#E32067',
        '#9747FF', '#00D6E2', '#DBFF00', '#FF5388'
    ];
    for (let i = 0; i < numColors; i++) {
        colors.push(granatumColors[i % granatumColors.length]);
    }
    return colors;
  }

  private handleError(err: HttpErrorResponse, operation: string): void {
      this.isLoading = false;
      this.isError = true;
      this.message = `Erro ao ${operation}: ${err.error?.message || err.message}`;
      console.error(`Erro ao ${operation}:`, err);
  }
}
