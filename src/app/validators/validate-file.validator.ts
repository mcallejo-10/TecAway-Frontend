import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';

export function validateFile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;
  
      const maxSize = 5 * 1024 * 1024; // Aumentado a 5MB para archivos de iPhone
      if (file.size > maxSize) {
        return { maxSize: true };
      }
  
      // Tipos de archivo permitidos, incluyendo HEIC de iPhone
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic', // Formato nativo de iPhone
        'image/heif'  // Formato relacionado con HEIC
      ];
      
      const isValidType = allowedTypes.includes(file.type) || 
                         file.name.toLowerCase().endsWith('.heic') ||
                         file.name.toLowerCase().endsWith('.heif');
      
      if (!isValidType && !file.type.startsWith('image/')) {
        return { invalidFormat: true };
      }
  
      return null;
    };
  }