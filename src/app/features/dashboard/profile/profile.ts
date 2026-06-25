import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../../core/services/subject.service';
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
  private subjectService = inject(SubjectService);
  private fb = inject(FormBuilder);
  private msg = inject(NzMessageService);

  profileForm!: FormGroup;
  isLoading = false;

  facultySpecializations: Record<string, string[]> = {
    'FMI': ['Informatica', 'Matematica', 'Informatica Aplicata'],
    'FSEGA': ['Cibernetica', 'Contabilitate', 'Management'],
    'Litere': ['Limba si Literatura', 'Studii Culturale'],
    'Drept': ['Drept Penal', 'Drept Civil'],
    'Medicina': ['Medicina Generala', 'Stomatologie']
  };

  get faculties() {
    return Object.keys(this.facultySpecializations);
  }

  availableSpecializations: string[] = [];
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

    if (user?.faculty) {
      this.availableSpecializations = this.facultySpecializations[user.faculty] || [];
    }

    this.profileForm.get('faculty')?.valueChanges.subscribe(faculty => {
      this.availableSpecializations = faculty ? this.facultySpecializations[faculty] : [];
      this.profileForm.get('specialization')?.setValue(null);
      this.profileForm.get('studyYear')?.setValue('1');
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const updatedData = this.profileForm.value;
      const oldFaculty = this.authService.currentUser()?.faculty;
      
      this.authService.updateProfile(updatedData).subscribe({
        next: () => {
          this.isLoading = false;
          
          if (oldFaculty && oldFaculty !== updatedData.faculty) {
            this.subjectService.resetUserSubjects(updatedData.email).subscribe();
          }

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
