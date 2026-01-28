import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pets } from './pets.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { UtilService } from '../../core/services/util.service';
import { of } from 'rxjs';

describe('Pets', () => {
  let component: Pets;
  let fixture: ComponentFixture<Pets>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllPets', 'searchPets']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert']);

    apiServiceSpy.getAllPets.and.returnValue(of({ content: [], totalElements: 0 }));

    await TestBed.configureTestingModule({
      imports: [Pets],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Pets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
