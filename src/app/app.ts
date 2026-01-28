import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components_utils/header/header";
import { Footer } from "./components_utils/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public title = 'wagnerviniciustorresdossantosferreira026070';
}
