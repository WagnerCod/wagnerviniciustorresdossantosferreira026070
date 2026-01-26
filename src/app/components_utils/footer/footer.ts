import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();
}
