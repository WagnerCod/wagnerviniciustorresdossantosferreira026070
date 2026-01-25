import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTutor } from './register-tutor';

describe('RegisterTutor', () => {
  let component: RegisterTutor;
  let fixture: ComponentFixture<RegisterTutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterTutor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterTutor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
