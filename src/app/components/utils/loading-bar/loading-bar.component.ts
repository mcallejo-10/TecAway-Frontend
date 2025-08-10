import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-bar',
  imports: [],
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.scss'
})

export class LoadingBarComponent {
  @Input() message = 'Cargando técnicos...';
  @Input() showIcon = true;
  @Input() showMessage = true;
}
