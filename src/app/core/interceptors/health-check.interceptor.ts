import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UtilService } from '../services/util.service';
import { HealthCheckService } from '../services/health-check.service';


export const healthCheckInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const utilService = inject(UtilService);
    const healthCheckService = inject(HealthCheckService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Ignora erros em requisições de autenticação (já tratados pelo auth interceptor)
            if (req.url.includes('/autenticacao/')) {
                return throwError(() => error);
            }
         
            const isServerError =
                error.status === 0 ||  // Servidor offline / Network error
                error.status === 503 || // Service Unavailable
                error.status === 504 || // Gateway Timeout
                error.status === 502;   // Bad Gateway

            if (isServerError) {
                console.error('Health Check Interceptor: Erro detectado', {
                    status: error.status,
                    message: error.message,
                    url: req.url
                });

                // Obtém o status atual de saúde
                const healthStatus = healthCheckService.getCurrentHealthStatus();

                // Se já teve muitas falhas consecutivas, redireciona
                if (healthStatus.consecutiveFailures >= 2 || error.status === 0) {
                    console.warn('Redirecionando para página de sistema indisponível');

                    // Salva a URL atual para poder redirecionar de volta depois
                    const currentUrl = router.url;
                    if (currentUrl !== '/system-unavailable') {
                        sessionStorage.setItem('returnUrl', currentUrl);
                    }

                    
                    router.navigate(['/system-unavailable']);
                } else {               
                    const message = getErrorMessage(error);
                    utilService.showError(message);
                }
            }

            return throwError(() => error);
        })
    );
};


function getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
        case 0:
            return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        case 502:
            return 'Erro no gateway do servidor.';
        case 503:
            return 'Servidor temporariamente indisponível.';
        case 504:
            return 'Tempo limite de conexão excedido.';
        default:
            return 'Erro ao comunicar com o servidor.';
    }
}
