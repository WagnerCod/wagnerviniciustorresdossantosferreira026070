import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterTutor } from './register-tutor';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';


describe('RegisterTutor', () => {
  let component: RegisterTutor;
  let fixture: ComponentFixture<RegisterTutor>;

  beforeEach(async () => {
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
