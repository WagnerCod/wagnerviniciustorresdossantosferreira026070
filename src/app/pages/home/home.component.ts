import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [SharedModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = 'Usuário';
    isMenuOpen = false;

    ngOnInit() {
        // Verifica se está autenticado
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login']);
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
