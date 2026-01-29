import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetDetailComponent } from './pet-detail.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../core/services/util.service';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';

describe('PetDetailComponent', () => {
    let component: PetDetailComponent;
    let fixture: ComponentFixture<PetDetailComponent>;

    beforeEach(async () => {
        const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getPetById', 'getTutorById']);
        const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert', 'showError']);
        const activatedRouteSpy = {
            params: of({ id: '1' }),
            snapshot: { params: { id: '1' } }
        };

        await TestBed.configureTestingModule({
            imports: [PetDetailComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                provideHttpClient(),
                { provide: ApiService, useValue: apiServiceSpy },
                { provide: UtilService, useValue: utilServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PetDetailComponent);
        component = fixture.componentInstance;
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });
});