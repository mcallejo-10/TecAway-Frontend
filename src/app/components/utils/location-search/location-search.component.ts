import { Component, Input, Output, EventEmitter, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LocationService, LocationSuggestion } from '../../../services/location/location.service';

export interface LocationData {
  city: string;
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

    // Establecer valor inicial si existe
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
    
    // Emitir datos de ubicación
    this.locationSelected.emit({
      city: locationText,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
  }

  async searchLocation(): Promise<void> {
    const query = this.inputValue();
    
    if (!query || query.trim() === '') {
      return;
    }

    try {
      const coords = await this.locationService.geocodeLocation(query);
      
      if (!coords) {
        alert(`No se encontró la ubicación: "${query}".\nIntenta con otra ciudad o sé más específico.`);
        return;
      }

      this.locationSelected.emit({
        city: query.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      this.showSuggestions.set(false);
      
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      alert('Hubo un error al buscar la ubicación. Por favor, inténtalo de nuevo.');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.searchLocation();
    }
  }
}
