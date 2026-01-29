import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tutors } from './tutors.component';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { of } from 'rxjs';

describe('Tutors', () => {
  let component: Tutors;
  let fixture: ComponentFixture<Tutors>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllTutores', 'searchTutores']);

    apiServiceSpy.getAllTutores.and.returnValue(of({ content: [], totalElements: 0 }));

    await TestBed.configureTestingModule({
      imports: [Tutors],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tutors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});