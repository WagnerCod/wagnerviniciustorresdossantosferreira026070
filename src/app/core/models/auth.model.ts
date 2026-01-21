export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
}
