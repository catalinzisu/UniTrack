import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink,
    NzFormModule, 
    NzInputModule, 
    NzButtonModule, 
    NzSelectModule,
    NzGridModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  faculties = ['FMI', 'FSEGA', 'Litere', 'Drept'];
  specializations = ['Informatica', 'Matematica', 'Cibernetica', 'Drept Penal'];
  studyYears = ['1', '2', '3', '4', 'Master 1', 'Master 2'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.studentEmail()]],
      password: ['', [Validators.required, CustomValidators.strongPassword()]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      faculty: [null, [Validators.required]],
      specialization: [null, [Validators.required]],
      studyYear: [null, [Validators.required]]
    }, {
      validators: [CustomValidators.matchPasswords('password', 'confirmPassword')]
    });
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      // Salvează datele utilizatorului în localStorage pentru a le folosi la login
      const userData = { ...this.registerForm.value };
      delete userData.password;
      delete userData.confirmPassword;
      localStorage.setItem('registered_user', JSON.stringify(userData));

      // Simulăm un request de înregistrare
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/auth/login']);
      }, 1000);
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
