import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetTutor } from './pet-tutor';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../core/services/util.service';
import { of } from 'rxjs';
import { ApiService } from '../../core/services/api-service';

describe('PetTutor', () => {
  let component: PetTutor;
  let fixture: ComponentFixture<PetTutor>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getTutorPets', 'getAllTutores', 'getAllPets', 'getTutores', 'getPets']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert', 'showError']);
    const activatedRouteSpy = {
      snapshot: { queryParams: {} },
      queryParams: of({})
    };

    apiServiceSpy.getAllTutores.and.returnValue(of({ content: [] }));
    apiServiceSpy.getAllPets.and.returnValue(of({ content: [] }));
    apiServiceSpy.getTutores.and.returnValue(of({ content: [] }));
    apiServiceSpy.getPets.and.returnValue(of({ content: [] }));

    await TestBed.configureTestingModule({
      imports: [PetTutor],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetTutor);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
