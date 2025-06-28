// src/app/components/transactions/transactions.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction } from '../../models/transaction.model';
import { Category } from '../../models/category.model';
import { HttpErrorResponse } from '@angular/common/http';
// NÃO INJETAR AuthService e Router aqui, pois o Interceptor cuida disso globalmente
// import { AuthService } from '../../services/auth.service';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];

  newTransaction: Transaction = {
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    categoryId: 0, // Valor inicial: 0 para indicar que nada foi selecionado ou carregado
    type: 'DESPESA' // Valor padrão temporário
  };

  selectedTransaction: Transaction | null = null;
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false; // <--- NOVA VARIÁVEL PARA O INDICADOR DE CARREGAMENTO

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
    // NÃO INJETAR AuthService e Router aqui
    // private authService: AuthService,
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories(); // Carrega as categorias primeiro
    this.loadTransactions(); // Depois carrega as transações
  }

  loadTransactions(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.isLoading = false; // <--- Finaliza o carregamento
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false; // <--- Finaliza o carregamento
        this.handleError(err, 'carregar transações'); // <--- Usar função auxiliar
      }
    });
  }

  loadCategories(): void {
    // Não usamos isLoading aqui, pois é um carregamento de suporte
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (this.categories.length > 0) {
          if (this.newTransaction.categoryId === 0 || !this.categories.some(c => c.id === this.newTransaction.categoryId)) {
              this.newTransaction.categoryId = this.categories[0].id!;
              this.newTransaction.type = this.categories[0].type;
          }
        } else {
            this.isError = true;
            this.message = 'Nenhuma categoria encontrada. Cadastre categorias antes de adicionar transações.';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar categorias para o dropdown:', err);
        // Não é um erro fatal que impeça o componente de carregar, mas a mensagem é útil
        this.message = 'Erro ao carregar categorias. O formulário de transações pode não funcionar corretamente.';
        this.isError = true;
      }
    });
  }

  addTransaction(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    if (!this.newTransaction.description || this.newTransaction.amount === 0 || !this.newTransaction.date || this.newTransaction.categoryId === 0) {
      this.isLoading = false; // Finaliza o carregamento
      this.isError = true;
      this.message = 'Todos os campos da transação (descrição, valor, data, categoria) são obrigatórios.';
      return;
    }

    const selectedCategoryObj = this.categories.find(c => c.id === +this.newTransaction.categoryId);
    if (selectedCategoryObj) {
      this.newTransaction.type = selectedCategoryObj.type;
    } else {
      this.isLoading = false; // Finaliza o carregamento
      this.isError = true;
      this.message = 'Categoria selecionada inválida. Por favor, selecione uma categoria válida.';
      return;
    }

    this.transactionService.createTransaction(this.newTransaction).subscribe({
      next: (transaction) => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Transação adicionada com sucesso!';
        this.loadTransactions();
        this.newTransaction = {
          description: '',
          amount: 0,
          date: new Date().toISOString().slice(0, 10),
          categoryId: this.categories.length > 0 ? this.categories[0].id! : 0,
          type: this.categories.length > 0 ? this.categories[0].type : 'DESPESA'
        };
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false; // Finaliza o carregamento
        this.handleError(err, 'adicionar transação'); // <--- Usar função auxiliar
      }
    });
  }

  editTransaction(transaction: Transaction): void {
    this.selectedTransaction = {
      ...transaction,
      date: transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    };
    this.message = '';
    this.isError = false;
  }

  updateTransaction(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    if (!this.selectedTransaction || this.selectedTransaction.id === undefined) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Nenhuma transação selecionada para atualização.';
      return;
    }
    if (!this.selectedTransaction.description || this.selectedTransaction.amount === 0 || !this.selectedTransaction.date || this.selectedTransaction.categoryId === 0) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Todos os campos da transação (descrição, valor, data, categoria) são obrigatórios.';
      return;
    }

    const selectedCategoryObj = this.categories.find(c => c.id === +this.selectedTransaction!.categoryId);
    if (selectedCategoryObj) {
      this.selectedTransaction.type = selectedCategoryObj.type;
    } else {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Categoria selecionada inválida. Por favor, selecione uma categoria válida.';
      return;
    }

    this.transactionService.updateTransaction(this.selectedTransaction.id, this.selectedTransaction).subscribe({
      next: (transaction) => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Transação atualizada com sucesso!';
        this.loadTransactions();
        this.selectedTransaction = null;
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false; // Finaliza o carregamento
        this.handleError(err, 'atualizar transação'); // <--- Usar função auxiliar
      }
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Transação excluída com sucesso!';
        this.loadTransactions();
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false; // Finaliza o carregamento
        this.handleError(err, 'excluir transação'); // <--- Usar função auxiliar
      }
    });
  }

  cancelEdit(): void {
    this.selectedTransaction = null;
    this.message = '';
    this.isError = false;
  }

  // Função auxiliar para tratamento de erros HTTP genérico (simplificada para confiar no Interceptor)
  private handleError(err: HttpErrorResponse, operation: string): void {
    this.isError = true;
    console.error(`Erro ao ${operation}:`, err);

    let errorMessage = `Erro desconhecido ao ${operation}.`;
    if (err.error && typeof err.error === 'object' && err.error.message) {
        errorMessage = err.error.message;
    } else if (err.message) {
        errorMessage = err.message;
    } else if (err.status === 0) { // Erro de rede sem resposta do servidor
        errorMessage = `Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está online.`;
    }

    this.message = `Erro ao ${operation}: ${errorMessage}`;
    // A lógica de redirecionamento para 401/403 ou Http failure during parsing
    // está agora no AuthInterceptor global.
  }

  // Novo método: Limpa a mensagem após um atraso para feedback temporário
  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 5000); // Limpa após 5 segundos
  }

  getCategoryName(categoryId: number | undefined): string {
    if (categoryId === undefined || categoryId === null) {
        return 'N/A';
    }
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }
}
