import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateTutors } from './update-tutors';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../core/services/util.service';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';

describe('UpdateTutors', () => {
  let component: UpdateTutors;
  let fixture: ComponentFixture<UpdateTutors>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getTutorById', 'updateTutor']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert', 'showError']);
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      snapshot: { params: { id: '1' } }
    };

    await TestBed.configureTestingModule({
      imports: [UpdateTutors],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateTutors);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
