import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly API_URL = environment.apiUrl + '/autenticacao';

    private readonly TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    private refreshTokenTimeout?: ReturnType<typeof setTimeout>;
    private isRefreshing = false; // Flag para evitar múltiplas renovações simultâneas
    private failedRefreshAttempts = 0; // Contador de tentativas falhadas
    private readonly MAX_REFRESH_ATTEMPTS = 2; // Máximo de tentativas antes de deslogar

    public token$ = this.tokenSubject.asObservable();
    public isAuthenticated = computed(() => !!this.tokenSubject.value && !this.isTokenExpired());

    /**
     * Verifica autenticação de forma síncrona
     */
    checkAuth(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired();
    }

    constructor() {
        // Verifica se há um token válido ao inicializar
        const token = this.getToken();
        const refreshToken = this.getRefreshToken();
        const timeToExpiry = this.getTimeToExpiry();

        // Só agenda refresh se tiver tempo suficiente (mais de 2 minutos)
        if (token && refreshToken && !this.isTokenExpired() && timeToExpiry > 120000) {
            console.log('Token válido encontrado. Agendando renovação automática.');
            this.scheduleTokenRefresh();
        } else if (token && (this.isTokenExpired() || timeToExpiry <= 120000)) {
            // Token expirado ou prestes a expirar sem tempo de renovar
            console.warn('Token expirado ou sem tempo para renovação. Limpando autenticação.');
            this.clearAuth();
        }
    }


    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
            .pipe(
                tap(response => {
                    this.failedRefreshAttempts = 0; // Reseta contador de falhas
                    this.handleAuthResponse(response);
                }),
                catchError(error => {
                    console.error('Erro no login:', error);
                    return throwError(() => error);
                })
            );
    }

    refreshToken(): Observable<RefreshTokenResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            console.warn('Tentativa de renovar token sem refresh token disponível');
            this.clearAuth();
            this.router.navigate(['/login']);
            return throwError(() => new Error('Refresh token não encontrado'));
        }

        // Verifica se já excedeu o número máximo de tentativas
        if (this.failedRefreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
            console.error('Número máximo de tentativas de renovação excedido. Deslogando usuário.');
            this.clearAuth();
            this.router.navigate(['/login'], {
                queryParams: { sessionExpired: 'true', reason: 'max_attempts' }
            });
            return throwError(() => new Error('Máximo de tentativas excedido'));
        }

        // Evita múltiplas requisições de refresh simultâneas
        if (this.isRefreshing) {
            console.log('Já existe uma renovação em andamento, aguardando...');
            return throwError(() => new Error('Refresh já em andamento'));
        }

        this.isRefreshing = true;
        console.log(`Tentando renovar token (tentativa ${this.failedRefreshAttempts + 1}/${this.MAX_REFRESH_ATTEMPTS})...`);

        const headers = {
            'Authorization': `Bearer ${refreshToken}`
        };

        return this.http.put<RefreshTokenResponse>(`${this.API_URL}/refresh`, {}, {
            headers: headers
        }).pipe(
            tap(response => {
                console.log('Token renovado com sucesso');
                this.failedRefreshAttempts = 0; // Reseta contador ao ter sucesso
                this.handleAuthResponse(response);
                this.isRefreshing = false;
            }),
            catchError(error => {
                this.isRefreshing = false;
                this.failedRefreshAttempts++;

                console.error('Erro ao renovar token:', error);
                console.log('Status:', error.status);
                console.log('Mensagem:', error.error?.message || error.message);
                console.log(`Tentativas falhadas: ${this.failedRefreshAttempts}/${this.MAX_REFRESH_ATTEMPTS}`);

                // Se for 401 (não autorizado), o refresh token está inválido/expirado
                if (error.status === 401 || this.failedRefreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
                    console.error('Refresh token inválido ou expirado. Limpando autenticação.');
                    this.clearAuth();
                    this.router.navigate(['/login'], {
                        queryParams: {
                            sessionExpired: 'true',
                            reason: error.status === 401 ? 'refresh_expired' : 'refresh_failed'
                        }
                    });
                }

                return throwError(() => error);
            })
        );
    }


    logout(): void {
        this.clearAuth();
        this.router.navigate(['/login']);
    }


    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }


    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }


    isTokenExpired(): boolean {
        const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (!expiry) return true;

        return Date.now() > parseInt(expiry);
    }

    /**
     * Obtém tempo restante até expiração em milissegundos
     */
    getTimeToExpiry(): number {
        const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (!expiry) return 0;

        return Math.max(0, parseInt(expiry) - Date.now());
    }

    /**
     * Processa a resposta de autenticação
     */
    private handleAuthResponse(response: LoginResponse | RefreshTokenResponse): void {
        const expiryTime = Date.now() + (response.expires_in * 1000);

        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

        this.tokenSubject.next(response.access_token);
        this.scheduleTokenRefresh();
    }

    /**
     * Agenda a renovação automática do token
     * Renova o token 1 minuto antes de expirar
     */
    private scheduleTokenRefresh(): void {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }

        const timeToExpiry = this.getTimeToExpiry();
        const refreshTime = Math.max(0, timeToExpiry - 60000); // 1 minuto antes

        // Não agenda se não houver tempo suficiente (menos de 2 minutos)
        if (timeToExpiry < 120000) {
            console.warn(`Tempo insuficiente para agendar renovação (${Math.floor(timeToExpiry / 1000)}s restantes)`);
            return;
        }

        // Só agenda se houver refresh token
        if (!this.getRefreshToken()) {
            console.warn('Refresh token não encontrado. Não será possível renovar automaticamente.');
            return;
        }

        console.log(`Renovação automática agendada para daqui a ${Math.floor(refreshTime / 1000)}s`);

        this.refreshTokenTimeout = setTimeout(() => {
            // Verifica novamente antes de executar
            if (!this.getRefreshToken()) {
                console.error('Refresh token não disponível para renovação');
                this.clearAuth();
                this.router.navigate(['/login'], {
                    queryParams: { sessionExpired: 'true' }
                });
                return;
            }

            // Verifica se não excedeu tentativas
            if (this.failedRefreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
                console.error('Número máximo de tentativas já foi excedido. Não tentará renovar.');
                this.clearAuth();
                this.router.navigate(['/login'], {
                    queryParams: { sessionExpired: 'true' }
                });
                return;
            }

            this.refreshToken().subscribe({
                next: () => console.log('Token renovado automaticamente'),
                error: (error) => {
                    console.error('Falha na renovação automática:', error);
                    // A limpeza e redirecionamento já são feitos no método refreshToken
                }
            });
        }, refreshTime);
    }

    /**
     * Limpa todos os dados de autenticação
     */
    private clearAuth(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

        this.tokenSubject.next(null);
        this.failedRefreshAttempts = 0; // Reseta contador

        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
    }
}
