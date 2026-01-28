import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoaderPersonalized } from './loader-personalized';

describe('LoaderPersonalized', () => {
  let component: LoaderPersonalized;
  let fixture: ComponentFixture<LoaderPersonalized>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderPersonalized],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderPersonalized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
