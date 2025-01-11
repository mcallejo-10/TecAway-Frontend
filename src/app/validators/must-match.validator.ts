import { AbstractControl, ValidationErrors } from '@angular/forms';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null; // Si no se encuentran los controles, no validar.
    }

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null; // Si otro validador ya marcó errores, no sobrescribir.
    }

    // Configura el error si los valores no coinciden.
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null); // Limpia el error si coinciden.
    }

    return null; // Siempre retorna `null` para indicar que no hay errores a nivel de grupo.
  };
}
