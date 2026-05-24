import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    NzCardModule, 
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private msg = inject(NzMessageService);

  profileForm!: FormGroup;
  isLoading = false;

  faculties = ['FMI', 'FSEGA', 'Litere', 'Drept', 'Medicina'];
  specializations = ['Informatica', 'Matematica', 'Cibernetica', 'Drept Penal', 'Medicina Generala'];
  studyYears = ['1', '2', '3', '4', '5', '6', 'Master 1', 'Master 2'];

  ngOnInit() {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName, [Validators.required]],
      lastName: [user?.lastName, [Validators.required]],
      email: [user?.email, [Validators.required, Validators.email]],
      faculty: [user?.faculty, [Validators.required]],
      specialization: [user?.specialization, [Validators.required]],
      studyYear: [user?.studyYear, [Validators.required]]
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const updatedData = this.profileForm.value;
      this.authService.updateProfile(updatedData).subscribe({
        next: () => {
          this.isLoading = false;
          this.msg.success('Profil actualizat cu succes!');
          this.profileForm.markAsPristine();
        },
        error: (err) => {
          this.isLoading = false;
          this.msg.error(err.message || 'Eroare la actualizarea profilului');
        }
      });
    }
  }
}
