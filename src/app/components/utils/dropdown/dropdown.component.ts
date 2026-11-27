import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);
  
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue = '';
  @Input() placeholder = 'Selecciona una opción';
  @Input() disabled = false;
  
  @Output() selectionChange = new EventEmitter<string>();
  
  isOpen = signal<boolean>(false);
  
  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }
  
  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
    }
  }
  
  selectOption(option: DropdownOption): void {
    if (!option.disabled) {
      this.selectedValue = option.value;
      this.selectionChange.emit(option.value);
      this.isOpen.set(false);
    }
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
