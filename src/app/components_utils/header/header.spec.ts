import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
