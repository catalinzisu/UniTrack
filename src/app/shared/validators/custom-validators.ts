import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static studentEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // let the required validator handle empty cases
      }
      const isValid = value.endsWith('@student.uni.ro') || value.endsWith('@student.unitbv.ro');
      return isValid ? null : { studentEmail: true };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      const hasMinLength = value.length >= 6;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && hasMinLength;

      if (!passwordValid) {
        return { strongPassword: true };
      }
      return null;
    };
  }

  static matchPasswords(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get(passwordKey)?.value;
      const confirmPass = group.get(confirmPasswordKey)?.value;

      if (!pass || !confirmPass) {
        return null;
      }

      return pass === confirmPass ? null : { passwordsMismatch: true };
    };
  }
}
