// src/app/components/categories/categories.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  newCategory: Category = { name: '', type: 'RECEITA' };
  selectedCategory: Category | null = null;
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false; // <--- NOVA VARIÁVEL PARA O INDICADOR DE CARREGAMENTO

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // <--- Limpa mensagens anteriores
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false; // <--- Finaliza o carregamento
        // Mensagem de "nenhuma categoria" será tratada no HTML
      },
      error: (err: HttpErrorResponse) => { // Tipar o erro
        this.isLoading = false; // <--- Finaliza o carregamento em caso de erro
        this.isError = true;
        this.message = `Erro ao carregar categorias: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao carregar categorias', err);
      }
    });
  }

  addCategory(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    if (!this.newCategory.name || !this.newCategory.type) {
      this.isLoading = false; // Finaliza o carregamento se a validação falhar
      this.isError = true;
      this.message = 'Nome e tipo da categoria são obrigatórios.';
      return;
    }

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (category) => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Categoria adicionada com sucesso!';
        this.loadCategories(); // Recarrega a lista
        this.newCategory = { name: '', type: 'RECEITA' }; // Limpa o formulário
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => { // Tipar o erro
        this.isLoading = false; // Finaliza o carregamento
        this.isError = true;
        this.message = `Erro ao adicionar categoria: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao adicionar categoria', err);
      }
    });
  }

  editCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.message = ''; // Limpa mensagens ao entrar no modo de edição
    this.isError = false; // Reset de erro
  }

  updateCategory(): void {
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    if (!this.selectedCategory || this.selectedCategory.id === undefined) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Nenhuma categoria selecionada para atualização.';
      return;
    }
    if (!this.selectedCategory.name || !this.selectedCategory.type) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Nome e tipo da categoria são obrigatórios.';
      return;
    }

    this.categoryService.updateCategory(this.selectedCategory.id, this.selectedCategory).subscribe({
      next: (category) => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Categoria atualizada com sucesso!';
        this.loadCategories();
        this.selectedCategory = null;
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => { // Tipar o erro
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao atualizar categoria: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao atualizar categoria', err);
      }
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }
    this.isLoading = true; // <--- Inicia o carregamento
    this.message = ''; // Limpa mensagens anteriores
    this.isError = false; // Reset de erro

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.isLoading = false; // Finaliza o carregamento
        this.isError = false;
        this.message = 'Categoria excluída com sucesso!';
        this.loadCategories();
        this.clearMessageAfterDelay(); // <--- Limpa a mensagem após um tempo
      },
      error: (err: HttpErrorResponse) => { // Tipar o erro
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao excluir categoria: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao excluir categoria', err);
      }
    });
  }

  cancelEdit(): void {
    this.selectedCategory = null;
    this.message = ''; // Limpa mensagens ao cancelar edição
    this.isError = false; // Reset de erro
  }

  // <--- NOVO MÉTODO: Limpa a mensagem após um atraso para feedback temporário
  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 5000); // Limpa após 5 segundos
  }
}
