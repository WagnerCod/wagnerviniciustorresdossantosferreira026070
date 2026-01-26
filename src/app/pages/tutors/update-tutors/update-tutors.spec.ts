import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTutors } from './update-tutors';

describe('UpdateTutors', () => {
  let component: UpdateTutors;
  let fixture: ComponentFixture<UpdateTutors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTutors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTutors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
