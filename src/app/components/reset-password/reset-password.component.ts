// src/app/components/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Para ler o token da URL
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordResetService } from '../../services/password-reset.service';
import { ResetPasswordRequest } from '../../models/reset-password-request.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute, // Para acessar parâmetros da URL
    private router: Router,
    private passwordResetService: PasswordResetService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.isError = true;
      this.message = 'Token de redefinição de senha não encontrado na URL.';
      // Pode redirecionar para uma página de erro ou forgot-password
      this.router.navigate(['/forgot-password']);
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    if (!this.token) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Token de redefinição inválido ou ausente.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Por favor, preencha todos os campos de senha.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'As senhas não coincidem.';
      return;
    }

    const request: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.passwordResetService.resetPassword(request).subscribe({
      next: (response: string) => {
        this.isLoading = false;
        this.isError = false;
        this.message = response; // Exibe a mensagem de sucesso do backend
        // Redireciona para o login após o sucesso
        this.router.navigate(['/login'], { queryParams: { resetSuccess: true } });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro ao redefinir senha: ${err.error?.message || err.message || JSON.stringify(err.error)}`;
        console.error('Erro ao redefinir senha:', err);
      }
    });
  }
}
