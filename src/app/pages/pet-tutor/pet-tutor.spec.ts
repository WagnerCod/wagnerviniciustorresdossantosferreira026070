import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetTutor } from './pet-tutor';

describe('PetTutor', () => {
  let component: PetTutor;
  let fixture: ComponentFixture<PetTutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetTutor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetTutor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
