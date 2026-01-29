import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { SystemUnavailableComponent } from './system-unavailable.component';
import { HealthCheckService } from '../../core/services/health-check.service';

// Mock component para as rotas
@Component({
    selector: 'app-mock',
    standalone: true,
    template: '<div>Mock</div>'
})
class MockComponent { }

describe('SystemUnavailableComponent', () => {
    let component: SystemUnavailableComponent;
    let fixture: ComponentFixture<SystemUnavailableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SystemUnavailableComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([
                    { path: 'home', component: MockComponent },
                    { path: 'login', component: MockComponent }
                ]),
                provideHttpClient(),
                provideAnimations(),
                HealthCheckService
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SystemUnavailableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // Limpa o sessionStorage após cada teste
        sessionStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
