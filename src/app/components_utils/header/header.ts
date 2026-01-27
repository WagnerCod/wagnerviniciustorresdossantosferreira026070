import { Component, inject, computed, signal, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);

  private currentRoute = signal(this.router.url);

  isVisible = computed(() => {
    const route = this.currentRoute();
    return route !== '/login' && route !== '/login?sessionExpired=true&reason=refresh_expired';
  });

  isAuthenticated = this.authService.isAuthenticated;
  mobileMenuOpen = signal(false);

  constructor() {
    // Atualiza a rota atual quando houver navegação
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
      });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  navigateTo(route: string): void {
    this.closeMobileMenu();
    this.router.navigate([route]);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
  }
}
