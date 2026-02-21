import { Component, Input, Output, EventEmitter, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LocationService, LocationSuggestion } from '../../../services/location/location.service';

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.scss'
})
export class LocationSearchComponent implements OnInit, OnDestroy {
  private locationService = inject(LocationService);
  private inputSubject = new Subject<string>();
  
  @Input() placeholder = 'Ej: Barcelona, España';
  @Input() initialValue = '';
  @Input() required = false;
  
  @Output() locationSelected = new EventEmitter<LocationData>();
  
  locationSuggestions = signal<LocationSuggestion[]>([]);
  showSuggestions = signal<boolean>(false);
  inputValue = signal<string>('');

  constructor() {
    // Debounce para búsqueda
    this.inputSubject.pipe(
      debounceTime(500)
    ).subscribe(async (query) => {
      if (!query || query.trim().length < 2) {
        this.locationSuggestions.set([]);
        this.showSuggestions.set(false);
        return;
      }

      try {
        const suggestions = await this.locationService.getLocationSuggestions(query);
        this.locationSuggestions.set(suggestions);
        this.showSuggestions.set(suggestions.length > 0);
      } catch (error) {
        console.error('Error obteniendo sugerencias:', error);
        this.locationSuggestions.set([]);
        this.showSuggestions.set(false);
      }
    });
  }

  ngOnInit(): void {
    // @Input() values are available here, not in the constructor
    if (this.initialValue) {
      this.inputValue.set(this.initialValue);
    }
  }

  ngOnDestroy(): void {
    this.inputSubject.complete();
  }

  onInput(value: string): void {
    this.inputValue.set(value);
    this.inputSubject.next(value);
  }

  selectSuggestion(suggestion: LocationSuggestion): void {
    const locationText = `${suggestion.city}, ${suggestion.country}`;
    this.inputValue.set(locationText);

    // Ocultar dropdown
    this.showSuggestions.set(false);
    this.locationSuggestions.set([]);

    // Emitir city y country separados para que el backend los reciba correctamente
    this.locationSelected.emit({
      city: suggestion.city,
      country: suggestion.country,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    // El usuario debe elegir del dropdown; Escape cierra las sugerencias
    if (event.key === 'Escape') {
      this.showSuggestions.set(false);
    }
  }
}
