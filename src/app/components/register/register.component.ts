import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  model: any = {};
  message: string = '';
  isError: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.register(this.model).subscribe({
      next: (response: any) => { // Corrigido
        this.isError = false;
        this.message = 'Usuário registrado com sucesso! Redirecionando para o login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => { // Corrigido
        this.isError = true;
        this.message = err.error || 'Ocorreu um erro no registro.';
      }
    });
  }
}
