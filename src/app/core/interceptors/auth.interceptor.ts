import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // Não adiciona token nas requisições de autenticação
    if (req.url.includes('/autenticacao/login') || req.url.includes('/autenticacao/refresh')) {
        return next(req);
    }

    // Adiciona o token no header se existir
    if (token && !authService.isTokenExpired()) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError(error => {
            // Se retornar 401, tenta renovar o token (mas apenas uma vez)
            if (error.status === 401 && !req.url.includes('/autenticacao/refresh') && authService.getRefreshToken()) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Retentar a requisição com o novo token
                        const newToken = authService.getToken();
                        if (!newToken) {
                            console.error('Token não disponível após refresh');
                            return throwError(() => new Error('Token não disponível'));
                        }

                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(clonedReq);
                    }),
                    catchError(refreshError => {
                        console.error('Falha ao renovar token no interceptor:', refreshError);
                        authService.logout();
                        router.navigate(['/login'], {
                            queryParams: { sessionExpired: 'true' }
                        });
                        return throwError(() => refreshError);
                    })
                );
            }

            // Se for 401 mas não tem refresh token, redireciona para login
            if (error.status === 401) {
                console.warn('Erro 401 sem refresh token disponível');
                authService.logout();
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};
