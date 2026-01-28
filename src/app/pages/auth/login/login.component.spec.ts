import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter, ActivatedRoute } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'checkAuth']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const activatedRouteSpy = {
            snapshot: { queryParams: {} },
            queryParams: of({})
        };

        authServiceSpy.checkAuth.and.returnValue(false);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, SharedModule, ReactiveFormsModule],
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideRouter([]),
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        fixture.detectChanges();
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });
});
