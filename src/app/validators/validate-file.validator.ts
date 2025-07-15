import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';

export function validateFile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;
  
      const maxSize = 5 * 1024 * 1024; // 5MB para archivos de iPhone
      if (file.size > maxSize) {
        return { maxSize: true };
      }
  
      // Tipos de archivo permitidos
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif'
      ];
      
      // Validación más flexible para archivos de iOS
      const fileName = file.name.toLowerCase();
      const isValidExtension = fileName.endsWith('.jpg') || 
                              fileName.endsWith('.jpeg') || 
                              fileName.endsWith('.png') || 
                              fileName.endsWith('.gif') || 
                              fileName.endsWith('.webp') || 
                              fileName.endsWith('.heic') || 
                              fileName.endsWith('.heif');
      
      const isValidMimeType = allowedTypes.includes(file.type) || file.type.startsWith('image/');
      
      // Safari a veces no reporta el MIME type correctamente para HEIC
      const isSafariHeicConversion = file.type === 'image/heic' || fileName.includes('heic');
      
      if (!isValidMimeType && !isValidExtension && !isSafariHeicConversion) {
        console.log('Archivo rechazado:', {
          name: file.name,
          type: file.type,
          isValidExtension,
          isValidMimeType,
          isSafariHeicConversion
        });
        return { invalidFormat: true };
      }
  
      return null;
    };
  }