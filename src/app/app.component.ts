// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterOutlet, RouterLink } from '@angular/router'; // Import RouterLink
import { AuthService } from './services/auth.service'; // Import AuthService
import { Router } from '@angular/router'; // Import Router


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // CommonModule para *ngIf
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sistema-financeiro-frontend';

  constructor(public authService: AuthService, private router: Router) { } // Injetar AuthService e Router

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
