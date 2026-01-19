import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown', () => {
    expect(component.isOpen()).toBe(false);
    component.toggleDropdown();
    expect(component.isOpen()).toBe(true);
    component.toggleDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should emit selection change', () => {
    const option = { value: 'test', label: 'Test Option' };
    let emittedValue = '';
    
    component.selectionChange.subscribe((value: string) => {
      emittedValue = value;
    });
    
    component.selectOption(option);
    expect(emittedValue).toBe('test');
    expect(component.isOpen()).toBe(false);
  });

  it('should not toggle when disabled', () => {
    component.disabled = true;
    component.toggleDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should return selected label', () => {
    component.options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ];
    component.selectedValue = 'option1';
    expect(component.selectedLabel).toBe('Option 1');
  });

  it('should return placeholder when no selection', () => {
    component.options = [];
    component.selectedValue = '';
    component.placeholder = 'Select...';
    expect(component.selectedLabel).toBe('Select...');
  });
});
