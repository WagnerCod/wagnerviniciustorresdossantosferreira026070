import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
import { Pets } from '../pets/pets.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [SharedModule, Pets],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    userName = 'Usuário';
    isMenuOpen = false;

    ngOnInit() {
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    login(){
        this.router.navigate(['/login']);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
