import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';

export function validateFile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;
  
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        return { maxSize: true };
      }
  
      if (!file.type.startsWith('image/')) {
        return { invalidFormat: true };
      }
  
      return null;
    };
  }