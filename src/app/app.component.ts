// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sistema-financeiro-frontend';
  isMenuOpen: boolean = false; // <--- NOVO: Estado do menu mobile

  constructor(public authService: AuthService, private router: Router) { }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // <--- NOVO: Método para alternar o menu mobile --->
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // <--- NOVO: Método para fechar o menu após clique em um link --->
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
