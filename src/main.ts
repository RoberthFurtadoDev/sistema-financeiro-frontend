// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Importar Chart e registerables aqui para registro global
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar todos os componentes padrão do Chart.js e o plugin datalabels globalmente
Chart.register(...registerables);
Chart.register(ChartDataLabels);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
