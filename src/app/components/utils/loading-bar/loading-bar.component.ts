import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [],
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.scss'
})
export class LoadingBarComponent {
  @Input() message: string = 'Cargando técnicos...';
  @Input() icon: string = 'bi-tools';
  @Input() showIcon: boolean = true;
  @Input() showMessage: boolean = true;
  @Input() useLogo: boolean = true; // Por defecto usar el logo
  @Input() logoPath: string = '/assets/img/Logo_TecAway_og.png';
}
