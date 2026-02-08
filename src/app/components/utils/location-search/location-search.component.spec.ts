import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationSearchComponent } from './location-search.component';
import { LocationService } from '../../../services/location/location.service';

describe('LocationSearchComponent', () => {
  let component: LocationSearchComponent;
  let fixture: ComponentFixture<LocationSearchComponent>;
  let mockLocationService: jasmine.SpyObj<LocationService>;

  beforeEach(async () => {
    mockLocationService = jasmine.createSpyObj('LocationService', [
      'getLocationSuggestions',
      'geocodeLocation'
    ]);

    await TestBed.configureTestingModule({
      imports: [LocationSearchComponent],
      providers: [
        { provide: LocationService, useValue: mockLocationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty suggestions', () => {
    expect(component.locationSuggestions()).toEqual([]);
    expect(component.showSuggestions()).toBe(false);
  });

  it('should set initial value if provided', () => {
    component.initialValue = 'Madrid, España';
    component.ngOnInit?.();
    expect(component.inputValue()).toBe('Madrid, España');
  });

  it('should emit location data when suggestion is selected', () => {
    const mockSuggestion = {
      city: 'Barcelona',
      country: 'España',
      state: 'Cataluña',
      latitude: 41.3851,
      longitude: 2.1734,
      display_name: 'Barcelona, España'
    };

    spyOn(component.locationSelected, 'emit');

    component.selectSuggestion(mockSuggestion);

    expect(component.locationSelected.emit).toHaveBeenCalledWith({
      city: 'Barcelona, España',
      latitude: 41.3851,
      longitude: 2.1734
    });
    expect(component.showSuggestions()).toBe(false);
  });

  it('should hide suggestions after selection', () => {
    const mockSuggestion = {
      city: 'Madrid',
      country: 'España',
      state: 'Comunidad de Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      display_name: 'Madrid, España'
    };

    component.showSuggestions.set(true);
    component.selectSuggestion(mockSuggestion);

    expect(component.showSuggestions()).toBe(false);
    expect(component.locationSuggestions()).toEqual([]);
  });

  it('should update input value on input event', () => {
    component.onInput('Barcelona');
    expect(component.inputValue()).toBe('Barcelona');
  });
});
