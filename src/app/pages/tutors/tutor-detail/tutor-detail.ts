import { Component } from '@angular/core';
import { PetTutor } from '../../pet-tutor/pet-tutor';

@Component({
  selector: 'app-tutor-detail',
  imports: [PetTutor],
  templateUrl: './tutor-detail.html',
  styleUrl: './tutor-detail.scss',
  standalone: true
})
export class TutorDetail {

}
