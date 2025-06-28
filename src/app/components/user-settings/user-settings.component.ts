// src/app/components/user-settings/user-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service'; // Importar UserService
import { User } from '../../models/user.model'; // Importar User model
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  user: User | null = null;
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.userService.getUserProfile().subscribe({
      next: (data: User) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao carregar perfil: ${err.error?.message || err.message}`;
        console.error('Erro ao carregar perfil:', err);
      }
    });
  }

  onSubmit(): void {
    if (!this.user) return;

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.userService.updateUserProfile(this.user).subscribe({
      next: (updatedUser: User) => {
        this.user = updatedUser;
        this.isLoading = false;
        this.isError = false;
        this.message = 'Perfil atualizado com sucesso!';
        setTimeout(() => { this.message = ''; }, 3000); // Limpa msg após 3s
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao atualizar perfil: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao atualizar perfil:', err);
      }
    });
  }
}
