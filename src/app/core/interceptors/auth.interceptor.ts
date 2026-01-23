import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
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
            // Se retornar 401, tenta renovar o token
            if (error.status === 401 && !req.url.includes('/autenticacao/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Retentar a requisição com o novo token
                        const newToken = authService.getToken();
                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(clonedReq);
                    }),
                    catchError(refreshError => {
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
