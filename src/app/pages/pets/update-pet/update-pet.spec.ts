import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdatePet } from './update-pet';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../core/services/util.service';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';

describe('UpdatePet', () => {
  let component: UpdatePet;
  let fixture: ComponentFixture<UpdatePet>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getPetById', 'updatePet', 'getAllTutores']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert', 'showError']);
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      snapshot: { params: { id: '1' } }
    };

    apiServiceSpy.getAllTutores.and.returnValue(of({ content: [] }));

    await TestBed.configureTestingModule({
      imports: [UpdatePet],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePet);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
