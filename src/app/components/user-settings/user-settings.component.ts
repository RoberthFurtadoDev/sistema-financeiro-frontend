// src/app/components/user-settings/user-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ChangePasswordRequest } from '../../models/change-password-request.model'; // <--- NOVO IMPORT
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

  // --- NOVAS PROPRIEDADES PARA MUDAR SENHA ---
  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  passwordMessage: string = '';
  isPasswordError: boolean = false;
  isPasswordLoading: boolean = false;

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

  onSubmit(): void { // Para atualizar nome/email
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
        setTimeout(() => { this.message = ''; }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao atualizar perfil: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao atualizar perfil:', err);
      }
    });
  }

  // <--- NOVO MÉTODO: Submeter mudança de senha --->
  onChangePasswordSubmit(): void {
    this.isPasswordLoading = true;
    this.passwordMessage = '';
    this.isPasswordError = false;

    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.isPasswordLoading = false;
      this.isPasswordError = true;
      this.passwordMessage = 'Todos os campos de senha são obrigatórios.';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.isPasswordLoading = false;
      this.isPasswordError = true;
      this.passwordMessage = 'A nova senha e a confirmação não coincidem.';
      return;
    }

    if (this.newPassword.length < 6) { // Exemplo de validação de senha forte
      this.isPasswordLoading = false;
      this.isPasswordError = true;
      this.passwordMessage = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }

    const request: ChangePasswordRequest = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(request).subscribe({
      next: (response: string) => { // Backend retorna string de sucesso
        this.isPasswordLoading = false;
        this.isPasswordError = false;
        this.passwordMessage = response; // "Senha alterada com sucesso!"
        this.oldPassword = ''; // Limpa campos
        this.newPassword = '';
        this.confirmNewPassword = '';
        setTimeout(() => { this.passwordMessage = ''; }, 5000);
      },
      error: (err: HttpErrorResponse) => {
        this.isPasswordLoading = false;
        this.isPasswordError = true;
        this.passwordMessage = `Erro ao mudar senha: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao mudar senha:', err);
      }
    });
  }
}
