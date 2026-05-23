import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
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

  private authService = inject(AuthService);
  private router = inject(Router);
  private msg = inject(NzMessageService);

  faculties = ['FMI', 'FSEGA', 'Litere', 'Drept', 'Medicina'];
  specializations = ['Informatica', 'Matematica', 'Cibernetica', 'Drept Penal', 'Medicina Generala'];
  studyYears = ['1', '2', '3', '4', '5', '6', 'Master 1', 'Master 2'];

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      faculty: [null, [Validators.required]],
      specialization: [null, [Validators.required]],
      studyYear: [null, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordsMismatch: true };
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const userData = { ...this.registerForm.value };
      delete userData.confirmPassword; // Nu salvam in BD
      
      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.msg.success('Cont creat cu succes! Te poți autentifica.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.msg.error(err.message || 'Eroare la înregistrare!');
        }
      });
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
