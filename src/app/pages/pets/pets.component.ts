import { FormBuilder } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pets',
  imports: [SharedModule],
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.scss',
  standalone: true
})
export class Pets {
  private FormBuilder = inject(FormBuilder);
  private router = inject(Router);


  navRegisterPet() {
    this.router.navigate(['/pets/register']);
  }
}
