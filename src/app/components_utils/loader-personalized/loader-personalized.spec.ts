import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderPersonalized } from './loader-personalized';

describe('LoaderPersonalized', () => {
  let component: LoaderPersonalized;
  let fixture: ComponentFixture<LoaderPersonalized>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderPersonalized]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderPersonalized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
