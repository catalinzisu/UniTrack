import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { differenceInDays } from 'date-fns';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { Subject } from '../../core/models/subject.model';
import { MOCK_SUBJECTS } from '../../core/mocks/mock-data';
import { AppRatingComponent } from '../../shared/components/rating/rating.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzTableModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzGridModule,
    NzInputModule,
    NzPopconfirmModule,
    NzDividerModule,
    NzModalModule,
    NzFormModule,
    ReactiveFormsModule,
    AppRatingComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  user: any;
  
  // Stocăm lista de materii într-un Signal (pentru ștergere și modificări locale)
  subjectsList = signal<Subject[]>([]);
  
  // Stocăm query-ul de căutare
  searchQuery = signal<string>('');

  // Semnal calculat derivat care aplică filtarea de căutare
  filteredSubjects = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const currentList = this.subjectsList();
    
    if (!query) {
      return currentList;
    }
    
    return currentList.filter(subject => 
      subject.name.toLowerCase().includes(query) || 
      subject.professor.toLowerCase().includes(query)
    );
  });

  isAddModalVisible = false;
  isEditModalVisible = false;
  addSubjectForm: FormGroup;
  editSubjectForm: FormGroup;
  editingSubjectId: number | null = null;

  constructor(private authService: AuthService, private router: Router, private msg: NzMessageService, private fb: FormBuilder) {
    this.addSubjectForm = this.fb.group({
      name: ['', Validators.required],
      professor: ['', Validators.required],
      examDate: ['', Validators.required]
    });
    this.editSubjectForm = this.fb.group({
      materialUrl: [''],
      comment: ['']
    });
  }

  ngOnInit() {
    this.user = this.authService.currentUser();
    
    // Filtrare Inteligentă la inițializare
    if (this.user) {
      const matchingSubjects = MOCK_SUBJECTS.filter(s => 
        s.faculty === this.user.faculty && 
        s.specialization === this.user.specialization && 
        String(s.studyYear) === String(this.user.studyYear)
      );
      this.subjectsList.set(matchingSubjects);
    } else {
      this.subjectsList.set([]);
    }
  }

  notImplemented() {
    this.msg.info('Această funcționalitate va fi implementată în curând!');
  }

  deleteSubject(id: number) {
    this.subjectsList.update(list => list.filter(s => s.id !== id));
    this.msg.success('Materia a fost ștearsă.');
  }

  showAddModal() {
    this.addSubjectForm.reset();
    this.isAddModalVisible = true;
  }

  handleAddSubmit() {
    if (this.addSubjectForm.valid) {
      const formValue = this.addSubjectForm.value;
      const newSubject: Subject = {
        id: Date.now(),
        name: formValue.name,
        professor: formValue.professor,
        examDate: formValue.examDate,
        faculty: this.user?.faculty || '',
        specialization: this.user?.specialization || '',
        studyYear: this.user?.studyYear || '',
        professorRating: 0,
        examRating: 0
      };
      
      this.subjectsList.update(list => [...list, newSubject]);
      this.isAddModalVisible = false;
      this.msg.success('Materia a fost adăugată cu succes.');
    } else {
      Object.values(this.addSubjectForm.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  handleAddCancel() {
    this.isAddModalVisible = false;
  }

  showEditModal(subject: Subject) {
    this.editingSubjectId = subject.id;
    this.editSubjectForm.patchValue({
      materialUrl: subject.materialUrl || '',
      comment: subject.comment || ''
    });
    this.isEditModalVisible = true;
  }

  handleEditSubmit() {
    if (this.editingSubjectId) {
      const formValue = this.editSubjectForm.value;
      this.subjectsList.update(list => list.map(s => {
        if (s.id === this.editingSubjectId) {
          return { ...s, materialUrl: formValue.materialUrl, comment: formValue.comment };
        }
        return s;
      }));
      this.isEditModalVisible = false;
      this.editingSubjectId = null;
      this.msg.success('Materia a fost actualizată.');
    }
  }

  handleEditCancel() {
    this.isEditModalVisible = false;
    this.editingSubjectId = null;
  }

  hasTakenExam(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    const examDate = new Date(dateStr);
    examDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return examDate < today;
  }

  getExamReminder(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const examDate = new Date(dateStr);
    examDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (examDate < today) {
      return 'examen susținut';
    }
    
    const days = differenceInDays(examDate, today);
    if (days === 0) return 'astăzi';
    if (days === 1) return 'mâine';
    return `mai sunt ${days} zile`;
  }

  updateProfessorRating(id: number, newScore: number) {
    this.subjectsList.update(list => list.map(s => s.id === id ? { ...s, professorRating: newScore } : s));
  }

  updateExamRating(id: number, newScore: number) {
    this.subjectsList.update(list => list.map(s => s.id === id ? { ...s, examRating: newScore } : s));
  }

  sortByNameFn = (a: Subject, b: Subject) => a.name.localeCompare(b.name);
  sortByProfFn = (a: Subject, b: Subject) => a.professor.localeCompare(b.professor);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
