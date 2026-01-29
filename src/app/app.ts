import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components_utils/header/header";
import { Footer } from "./components_utils/footer/footer";
import { HealthCheckService } from './core/services/health-check.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private healthCheckService = inject(HealthCheckService);
  public title = 'wagnerviniciustorresdossantosferreira026070';

  ngOnInit(): void {
    // Inicia o monitoramento de saúde da API
    this.healthCheckService.startMonitoring();
  }
}
