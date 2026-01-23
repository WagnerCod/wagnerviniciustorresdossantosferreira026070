export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    refresh_expires_in: number;
    expires_in: number;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
    refresh_expires_in: number;
    expires_in: number;
}
