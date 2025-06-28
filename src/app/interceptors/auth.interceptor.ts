// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token && !request.url.includes('/api/auth/')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Interceptor HTTP capturou um erro:', error);

        if (error.status === 401 || error.status === 403) {
          console.warn('Erro 401/403: Token inválido ou expirado. Redirecionando para login.');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        else if (error.status === 200 && error.url && error.url.includes('/login') && typeof error.error === 'string' && error.error.includes('<html')) {
            console.warn('Redirecionamento inesperado para login capturado. Forçando logout.');
            this.authService.logout();
            this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
