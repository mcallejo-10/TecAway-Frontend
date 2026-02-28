import { Component, Input, Output, EventEmitter, signal, OnDestroy, inject } from '@angular/core';
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
export class LocationSearchComponent implements OnDestroy {
  private locationService = inject(LocationService);
  private inputSubject = new Subject<string>();
  
  @Input() placeholder = 'Ej: Barcelona, España';
  @Input() set initialValue(val: string) {
    if (val) {
      this.inputValue.set(val);
    }
  }
  @Input() required = false;
  
  @Output() locationSelected = new EventEmitter<LocationData>();
  
  locationSuggestions = signal<LocationSuggestion[]>([]);
  showSuggestions = signal<boolean>(false);
  inputValue = signal<string>('');

  constructor() {
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
    this.showSuggestions.set(false);
    this.locationSuggestions.set([]);

    this.locationSelected.emit({
      city: suggestion.city,
      country: suggestion.country,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showSuggestions.set(false);
    }
  }
}
