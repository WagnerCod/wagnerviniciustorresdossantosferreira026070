import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('deve criar o app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
