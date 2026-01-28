import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterTutor } from './register-tutor';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { UtilService } from '../../../core/services/util.service';

describe('RegisterTutor', () => {
  let component: RegisterTutor;
  let fixture: ComponentFixture<RegisterTutor>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['registerTutor']);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', ['showAlert']);

    await TestBed.configureTestingModule({
      imports: [RegisterTutor],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterTutor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
