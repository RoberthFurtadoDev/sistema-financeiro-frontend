import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service'; // <--- NOVO IMPORT
import { ForgotPasswordRequest } from '../../models/forgot-password-request.model'; // <--- NOVO IMPORT


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private passwordResetService: PasswordResetService) { } // <--- NOVO: Injetar serviço

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    if (!this.email) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Por favor, digite seu e-mail.';
      return;
    }

    // <--- LÓGICA DE ENVIO REAL PARA O BACKEND --->
    const request: ForgotPasswordRequest = { email: this.email }; // Cria o objeto de requisição

    this.passwordResetService.requestPasswordReset(request).subscribe({ // Chama o serviço real
      next: (response: string) => { // O backend retorna uma String de sucesso
        this.isLoading = false;
        this.isError = false;
        this.message = response; // Exibe a mensagem de sucesso do backend
        this.email = ''; // Limpa o campo
        this.clearMessageAfterDelay();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = `Erro: ${err.error?.message || err.message || JSON.stringify(err.error)}`; // Exibe erro do backend
        console.error('Erro ao solicitar redefinição de senha:', err);
      }
    });
    // <--- FIM DA LÓGICA DE ENVIO REAL --->
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 5000);
  }
}
