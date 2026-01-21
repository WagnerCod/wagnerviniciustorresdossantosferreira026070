import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = 'https://pet-manager-api.geia.vip/autenticacao';

    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    private refreshTokenTimeout?: ReturnType<typeof setTimeout>;

    public token$ = this.tokenSubject.asObservable();
    public isAuthenticated = computed(() => !!this.tokenSubject.value && !this.isTokenExpired());

    constructor() {
        // Verifica se há um token válido ao inicializar
        if (this.getToken() && !this.isTokenExpired()) {
            this.scheduleTokenRefresh();
        } else if (this.isTokenExpired()) {
            this.clearAuth();
        }
    }


    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
            .pipe(
                tap(response => this.handleAuthResponse(response)),
                catchError(error => {
                    console.error('Erro no login:', error);
                    return throwError(() => error);
                })
            );
    }

    refreshToken(): Observable<RefreshTokenResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.clearAuth();
            return throwError(() => new Error('Refresh token não encontrado'));
        }

        return this.http.put<RefreshTokenResponse>(`${this.API_URL}/refresh`, {
            refreshToken
        }).pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(error => {
                console.error('Erro ao renovar token:', error);
                this.clearAuth();
                return throwError(() => error);
            })
        );
    }


    logout(): void {
        this.clearAuth();
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
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_expires_in);
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

        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken().subscribe({
                next: () => console.log('Token renovado automaticamente'),
                error: (error) => console.error('Falha na renovação automática:', error)
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

        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
    }
}
