// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // RouterLink para links no template
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Para tipagem do erro

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Certifique-se de que RouterLink está aqui
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  model: any = { email: '', password: '' }; // Model para email e password
  message: string = '';
  isError: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.message = ''; // Limpar mensagem anterior
    this.isError = false; // Resetar estado de erro

    this.authService.login(this.model).subscribe({
      next: (response: any) => {
        this.message = 'Login bem-sucedido!';
        console.log('Token salvo:', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => { // Tipar o erro como HttpErrorResponse
        this.isError = true;
        this.message = err.error?.message || err.message || 'Erro ao fazer login. Verifique suas credenciais.';
        console.error('Erro de login:', err);
      }
    });
  }
}
