import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-pets',
  imports: [SharedModule],
  templateUrl: './pets.html',
  styleUrl: './pets.scss',
  standalone: true
})
export class Pets {

}
