import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-bar',
  imports: [],
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.scss'
})

export class LoadingBarComponent {
  @Input() message: string = 'Cargando técnicos...';
  @Input() showIcon: boolean = true;
  @Input() showMessage: boolean = true;
}
