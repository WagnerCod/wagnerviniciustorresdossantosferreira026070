import { Component, input } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-loader-personalized',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './loader-personalized.html',
  styleUrl: './loader-personalized.scss'
})
export class LoaderPersonalized {
  isLoading = input<boolean>(false);
}
