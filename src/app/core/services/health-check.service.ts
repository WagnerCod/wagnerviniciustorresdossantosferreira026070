import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { catchError, map, timeout, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HealthStatus {
    isHealthy: boolean;
    lastCheck: Date;
    consecutiveFailures: number;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class HealthCheckService {
    private http = inject(HttpClient);

    private readonly HEALTH_CHECK_INTERVAL = 60000; // 60 segundos
    private readonly MAX_CONSECUTIVE_FAILURES = 3;
    private readonly REQUEST_TIMEOUT = 10000; // 10 segundos

    private healthStatus$ = new BehaviorSubject<HealthStatus>({
        isHealthy: true,
        lastCheck: new Date(),
        consecutiveFailures: 0
    });

    private isMonitoring = false;

    constructor() { }

    /**
     * Retorna o status atual de saúde da API
     */
    getHealthStatus(): Observable<HealthStatus> {
        return this.healthStatus$.asObservable();
    }

    /**
     * Retorna o status atual de forma síncrona
     */
    getCurrentHealthStatus(): HealthStatus {
        return this.healthStatus$.value;
    }

    /**
     * Verifica se a API está disponível fazendo uma requisição leve
     * Como a API de terceiros não tem endpoint de health, usa um endpoint qualquer
     */
    checkHealth(): Observable<boolean> {
        const apiUrl = environment.apiUrl;

        return this.http.head(apiUrl, {
            observe: 'response',
            responseType: 'text' as 'json'
        }).pipe(
            timeout(this.REQUEST_TIMEOUT),
            map(() => {
                this.updateHealthStatus(true);
                return true;
            }),
            catchError((error: HttpErrorResponse) => {
                // Se retornar 404, 405 ou similar, significa que a API está respondendo
                // mas apenas não tem o endpoint HEAD
                if (error.status === 404 || error.status === 405 || error.status === 401) {
                    this.updateHealthStatus(true);
                    return of(true);
                }

                // Erros que indicam servidor offline ou indisponível
                this.updateHealthStatus(false, this.getErrorMessage(error));
                return of(false);
            })
        );
    }

    /**
     * Inicia o monitoramento periódico de saúde
     */
    startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;

        // Primeira verificação imediata
        this.checkHealth().subscribe();

        // Verificações periódicas
        interval(this.HEALTH_CHECK_INTERVAL)
            .pipe(
                switchMap(() => this.checkHealth())
            )
            .subscribe({
                next: (isHealthy) => {
                    if (!isHealthy) {
                        console.warn(' Health Check: API não está respondendo');
                    }
                },
                error: (error) => {
                    console.error('Health Check: Erro no monitoramento', error);
                }
            });
    }

    /**
     * Para o monitoramento
     */
    stopMonitoring(): void {
        this.isMonitoring = false;
    }

    /**
     * Atualiza o status de saúde
     */
    private updateHealthStatus(isHealthy: boolean, message?: string): void {
        const currentStatus = this.healthStatus$.value;
        const newConsecutiveFailures = isHealthy
            ? 0
            : currentStatus.consecutiveFailures + 1;

        const newStatus: HealthStatus = {
            isHealthy: isHealthy || newConsecutiveFailures < this.MAX_CONSECUTIVE_FAILURES,
            lastCheck: new Date(),
            consecutiveFailures: newConsecutiveFailures,
            message: message
        };

        this.healthStatus$.next(newStatus);
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.status === 0) {
            return 'Servidor não está respondendo. Verifique sua conexão de internet.';
        } else if (error.status === 503) {
            return 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
        } else if (error.status === 504) {
            return 'Timeout na conexão com o servidor.';
        } else if (error.status >= 500) {
            return 'Erro interno do servidor.';
        }
        return 'Não foi possível conectar ao servidor.';
    }

    /**
     * Força uma verificação manual
     */
    forceCheck(): Observable<boolean> {
        return this.checkHealth();
    }

    /**
     * Reseta o contador de falhas consecutivas
     */
    resetFailureCount(): void {
        const currentStatus = this.healthStatus$.value;
        this.healthStatus$.next({
            ...currentStatus,
            consecutiveFailures: 0
        });
    }
}
