import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                provideHttpClient(),
                { provide: AuthService, useValue: authServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });
});
