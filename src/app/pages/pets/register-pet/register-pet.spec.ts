import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPet } from './register-pet';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('RegisterPet', () => {
  let component: RegisterPet;
  let fixture: ComponentFixture<RegisterPet>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['registerPet', 'getAllTutores']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert']);

    apiServiceSpy.getAllTutores.and.returnValue(of({ content: [] }));

    await TestBed.configureTestingModule({
      imports: [RegisterPet],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
