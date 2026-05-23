import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRateModule } from 'ng-zorro-antd/rate';

import { AppRatingComponent } from '../../../shared/components/rating/rating.component';
import { DaysUntilPipe } from '../../../shared/pipes/days-until.pipe';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Subject } from '../../../core/models/subject.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzPopconfirmModule,
    NzDividerModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzRateModule,
    AppRatingComponent,
    DaysUntilPipe
  ],
  templateUrl: './subjects.html',
  styleUrls: ['./subjects.scss']
})
export class SubjectsComponent {
  private subjectService = inject(SubjectService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  currentUser = this.authService.currentUser;

  userSubjectsSignal = computed(() => {
    const user = this.currentUser();
    if (user && user.faculty && user.specialization && user.studyYear) {
      return this.subjectService.getSubjectsForUser(user.faculty, user.specialization, user.studyYear)();
    }
    return [] as Subject[];
  });

  searchTerm = signal('');
  sortColumn = signal<string | null>(null);
  sortOrder = signal<string | null>(null);

  filteredSubjects = computed(() => {
    let subjects = this.userSubjectsSignal();
    const term = this.searchTerm().toLowerCase();

    if (term) {
      subjects = subjects.filter(s => 
        (s.name && s.name.toLowerCase().includes(term)) || 
        (s.professor && s.professor.toLowerCase().includes(term))
      );
    }

    const col = this.sortColumn();
    const order = this.sortOrder();

    if (col && order) {
      subjects = [...subjects].sort((a, b) => {
        const valA = (a as any)[col] || '';
        const valB = (b as any)[col] || '';
        if (valA < valB) return order === 'ascend' ? -1 : 1;
        if (valA > valB) return order === 'ascend' ? 1 : -1;
        return 0;
      });
    }

    return subjects;
  });

  isAddModalVisible = signal(false);
  isEditModalVisible = signal(false);
  editingSubjectId = signal<number | null>(null);

  addForm: FormGroup;
  editForm: FormGroup;

  constructor() {
    this.addForm = this.fb.group({
      name: [null, [Validators.required]],
      professor: [null, [Validators.required]],
      examDate: [null, [Validators.required]]
    });

    this.editForm = this.fb.group({
      materialUrl: [null],
      comment: [null],
      professorRating: [0],
      examRating: [{value: 0, disabled: false}]
    });
  }

  onSortChange(column: string, order: string | null): void {
    this.sortColumn.set(column);
    this.sortOrder.set(order);
  }

  isExamPending(examDate: string | Date | undefined): boolean {
    if (!examDate) return false;
    const date = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  showAddModal(): void {
    this.addForm.reset();
    this.isAddModalVisible.set(true);
  }

  handleAddCancel(): void {
    this.isAddModalVisible.set(false);
  }

  handleAddSubmit(): void {
    if (this.addForm.valid) {
      const user = this.currentUser();
      if (!user) return;

      const newSubject: Partial<Subject> = {
        ...this.addForm.value,
        faculty: user.faculty,
        specialization: user.specialization,
        studyYear: user.studyYear,
        professorRating: 0,
        examRating: 0
      };

      this.subjectService.addSubject(newSubject as Subject);
      this.message.success('Materia a fost adăugată cu succes!');
      this.isAddModalVisible.set(false);
    } else {
      Object.values(this.addForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  showEditModal(subject: Subject): void {
    if (subject.id) {
      this.editingSubjectId.set(subject.id);
    }
    
    if (this.isExamPending(subject.examDate)) {
      this.editForm.get('examRating')?.disable();
    } else {
      this.editForm.get('examRating')?.enable();
    }

    this.editForm.patchValue({
      materialUrl: subject.materialUrl,
      comment: subject.comment,
      professorRating: subject.professorRating || 0,
      examRating: subject.examRating || 0
    });

    this.isEditModalVisible.set(true);
  }

  handleEditCancel(): void {
    this.isEditModalVisible.set(false);
    this.editingSubjectId.set(null);
  }

  handleEditSubmit(): void {
    if (this.editForm.valid) {
      const id = this.editingSubjectId();
      if (id) {
        this.subjectService.updateSubject(id, this.editForm.getRawValue());
        this.message.success('Materia a fost actualizată!');
      }
      this.isEditModalVisible.set(false);
      this.editingSubjectId.set(null);
    }
  }

  deleteSubject(id: number | undefined): void {
    if (id) {
      this.subjectService.deleteSubject(id);
      this.message.success('Materia a fost ștearsă!');
    }
  }

  onProfessorRatingChange(subject: Subject, newRating: number): void {
    if (subject.id) {
      this.subjectService.updateSubject(subject.id, { professorRating: newRating });
    }
  }
}
