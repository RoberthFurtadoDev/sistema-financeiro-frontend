// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Import CurrencyPipe
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { ReportService } from '../../services/report.service'; // Import ReportService
import { Balance } from '../../models/balance.model'; // Import Balance model
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
// import { jwtDecode } from 'jwt-decode'; // Não é mais necessário aqui, AuthService já cuida

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Adicionado RouterLink
  providers: [CurrencyPipe], // Fornecer CurrencyPipe localmente se não global
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userBalance: number | null = null; // Balanço geral
  monthlyIncomes: number | null = null; // Receitas do mês
  monthlyExpenses: number | null = null; // Despesas do mês
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false; // Indicador de carregamento

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportService: ReportService, // Injetar ReportService
    private currencyPipe: CurrencyPipe // Injetar CurrencyPipe para formatação
  ) {}

  ngOnInit(): void {
    const usernameFromToken = this.authService.getUsernameFromToken();
    if (usernameFromToken) {
      this.username = usernameFromToken;
    } else {
      this.username = 'Usuário'; // Fallback
    }

    this.loadFinancialSummaries();
  }

  loadFinancialSummaries(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    // Carregar Balanço Atual
    this.reportService.getUserBalance().subscribe({
      next: (data: Balance) => {
        this.userBalance = data.balance;
        // console.log('Balanço Atual:', this.userBalance); // Log de depuração
      },
      error: (err: HttpErrorResponse) => {
        this.isError = true;
        this.message = `Erro ao carregar balanço: ${err.error?.message || err.message}`;
        console.error('Erro ao carregar balanço:', err);
      }
    });

    // Calcular Receitas e Despesas do Mês (reutilizando o endpoint de transações por período)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDayOfMonth = today.toISOString().slice(0, 10); // Até o dia atual

    this.reportService.getTransactionsByPeriod(firstDayOfMonth, lastDayOfMonth).subscribe({
      next: (transactions) => {
        let totalIncomes = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
          if (t.type === 'RECEITA') {
            totalIncomes += t.amount;
          } else if (t.type === 'DESPESA') {
            totalExpenses += t.amount;
          }
        });
        this.monthlyIncomes = totalIncomes;
        this.monthlyExpenses = totalExpenses;
        this.isLoading = false; // Finaliza o carregamento após todas as chamadas de dados

        // console.log('Receitas do Mês:', this.monthlyIncomes); // Log de depuração
        // console.log('Despesas do Mês:', this.monthlyExpenses); // Log de depuração
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false; // Finaliza o carregamento em caso de erro
        this.isError = true;
        this.message = `Erro ao carregar resumos mensais: ${err.error?.message || err.message}`;
        console.error('Erro ao carregar resumos mensais:', err);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
