import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Usa checkAuth() ao invés de isAuthenticated() para verificação síncrona
    if (authService.checkAuth()) {
        return true;
    }
//  { queryParams: { returnUrl: state.url } 
    router.navigate(['/login']);
    return false;
};
