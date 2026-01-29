import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { HealthCheckService, HealthStatus } from '../../core/services/health-check.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
    selector: 'app-system-unavailable',
    standalone: true,
    imports: [SharedModule],
    templateUrl: './system-unavailable.component.html',
    styleUrls: ['./system-unavailable.component.scss']
})
export class SystemUnavailableComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private healthCheckService = inject(HealthCheckService);
    private destroy$ = new Subject<void>();

    healthStatus: HealthStatus | null = null;
    isChecking = false;
    countdown = 10;
    private countdownInterval: any;

    ngOnInit(): void {
        // Monitora o status de saúde
        this.healthCheckService.getHealthStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe(status => {
                this.healthStatus = status;

                // Se o sistema voltar a ficar saudável, redireciona automaticamente
                if (status.isHealthy && status.consecutiveFailures === 0) {
                    this.redirectBack();
                }
            });

        // Inicia contagem regressiva para tentativa automática
        this.startCountdown();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    /**
     * Tenta verificar novamente a saúde da API
     */
    checkAgain(): void {
        this.isChecking = true;
        this.healthCheckService.forceCheck()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (isHealthy) => {
                    this.isChecking = false;
                    if (isHealthy) {
                        this.healthCheckService.resetFailureCount();
                        this.redirectBack();
                    }
                },
                error: () => {
                    this.isChecking = false;
                }
            });
    }

    /**
     * Redireciona de volta para a página anterior
     */
    private redirectBack(): void {
        const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
        sessionStorage.removeItem('returnUrl');
        this.router.navigate([returnUrl]);
    }

    /**
     * Inicia contagem regressiva para tentativa automática
     */
    private startCountdown(): void {
        this.countdown = 10;
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.countdownInterval);
                this.checkAgain();
            }
        }, 1000);
    }

    /**
     * Vai para a página de login
     */
    goToLogin(): void {
        sessionStorage.removeItem('returnUrl');
        this.router.navigate(['/login']);
    }
}
