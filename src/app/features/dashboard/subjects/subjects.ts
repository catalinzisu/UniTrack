import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { NzSelectModule } from 'ng-zorro-antd/select';

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
    NzSelectModule,
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
  private sanitizer = inject(DomSanitizer);

  currentUser = this.authService.currentUser;

  globalSubjects = signal<Subject[]>([]);
  mySubjects = signal<Subject[]>([]);

  addMode = signal<'select' | 'create'>('select');
  selectedGlobalSubjectId = signal<number | null>(null);

  searchTerm = signal('');
  sortColumn = signal<string | null>(null);
  sortOrder = signal<string | null>(null);

  // Sort comparator functions for nz-table columns
  sortByName = (a: Subject, b: Subject): number => (a.name || '').localeCompare(b.name || '');
  sortByProfessor = (a: Subject, b: Subject): number => (a.professor || '').localeCompare(b.professor || '');
  sortByMaterialsCount = (a: Subject, b: Subject): number => (a.materials?.length || 0) - (b.materials?.length || 0);
  sortByProfessorRating = (a: Subject, b: Subject): number => (a.professorRating || 0) - (b.professorRating || 0);
  sortByExamRating = (a: Subject, b: Subject): number => (a.examRating || 0) - (b.examRating || 0);
  sortByExamDate = (a: Subject, b: Subject): number =>
    (a.examDate ? new Date(a.examDate).getTime() : 0) - (b.examDate ? new Date(b.examDate).getTime() : 0);

  filteredSubjects = computed(() => {
    let subjects = this.mySubjects();
    const globals = this.globalSubjects();
    const term = this.searchTerm().toLowerCase();

    // Sincronizează datele comune (nume, profesor, materiale) cu cele din catalogul global
    // Astfel, dacă alt utilizator adaugă un material, acesta va apărea la toți!
    subjects = subjects.map(s => {
      const globalVer = globals.find(g => g.id === s.id);
      if (globalVer) {
        return { 
          ...s, 
          materials: globalVer.materials, 
          name: globalVer.name, 
          professor: globalVer.professor, 
          examDate: globalVer.examDate,
          globalProfessorRating: globalVer.professorRating || 0,
          globalExamRating: globalVer.examRating || 0,
          globalComments: globalVer.globalComments || []
        };
      }
      return s;
    });

    // Filter by user's current study year
    const user = this.currentUser();
    if (user && user.studyYear) {
      subjects = subjects.filter(s => String(s.studyYear) === String(user.studyYear));
    }

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
        let valA: any = '';
        let valB: any = '';

        if (col === 'materialsCount') {
          valA = a.materials?.length || 0;
          valB = b.materials?.length || 0;
        } else if (col === 'examDate') {
          valA = a.examDate ? new Date(a.examDate).getTime() : 0;
          valB = b.examDate ? new Date(b.examDate).getTime() : 0;
        } else if (col === 'professorRating' || col === 'examRating') {
          valA = (a as any)[col] || 0;
          valB = (b as any)[col] || 0;
        } else {
          valA = (a as any)[col] || '';
          valB = (b as any)[col] || '';
        }

        if (valA < valB) return order === 'ascend' ? -1 : 1;
        if (valA > valB) return order === 'ascend' ? 1 : -1;
        return 0;
      });
    }

    return subjects;
  });

  availableGlobalSubjects = computed(() => {
    const user = this.currentUser();
    const myIds = this.mySubjects().map(s => s.id);
    return this.globalSubjects().filter(s => {
      if (myIds.includes(s.id)) return false;
      if (!user) return true;
      return s.faculty === user.faculty && 
             s.specialization === user.specialization && 
             String(s.studyYear) === String(user.studyYear);
    });
  });

  isAddModalVisible = signal(false);
  isEditModalVisible = signal(false);
  editingSubjectId = signal<number | null>(null);

  getEditingSubject = computed(() => {
    const id = this.editingSubjectId();
    if (!id) return null;
    return this.filteredSubjects().find(s => s.id === id) || null;
  });

  newCommentText = signal('');

  isPreviewVisible = signal(false);
  previewUrl = signal<SafeResourceUrl | null>(null);

  addForm: FormGroup;
  editForm: FormGroup;

  constructor() {
    this.addForm = this.fb.group({
      name: [null, [Validators.required]],
      professor: [null, [Validators.required]],
      examDate: [null, [Validators.required]],
      materials: this.fb.array([])
    });

    this.editForm = this.fb.group({
      materials: this.fb.array([]),
      comment: [null],
      professorRating: [0],
      examRating: [{value: 0, disabled: false}]
    });

    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.subjectService.getGlobalSubjects().subscribe(globals => {
          this.globalSubjects.set(globals);
          
          this.subjectService.getUserSubjects(user.email).subscribe(personal => {
            if (!personal) {
              const myPersonal = globals.filter(s => 
                s.faculty === user.faculty && 
                s.specialization === user.specialization && 
                String(s.studyYear) === String(user.studyYear)
              );
              this.subjectService.saveUserSubjects(user.email, myPersonal).subscribe();
              this.mySubjects.set(myPersonal);
            } else {
              this.mySubjects.set(personal);
            }
          });
        });
      } else {
        this.globalSubjects.set([]);
        this.mySubjects.set([]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.subjectService.currentFilteredCount.set(this.filteredSubjects().length);
    }, { allowSignalWrites: true });
  }

  saveMySubjects() {
    const user = this.currentUser();
    if (user) {
      this.subjectService.saveUserSubjects(user.email, this.mySubjects()).subscribe();
    }
  }

  get addMaterials(): FormArray {
    return this.addForm.get('materials') as FormArray;
  }

  get editMaterials(): FormArray {
    return this.editForm.get('materials') as FormArray;
  }

  addMaterialField(form: FormGroup): void {
    const materials = form.get('materials') as FormArray;
    materials.push(this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  removeMaterialField(form: FormGroup, index: number): void {
    const materials = form.get('materials') as FormArray;
    materials.removeAt(index);
  }

  showPreview(url: string): void {
    let finalUrl = url;
    if (url.includes('drive.google.com') && url.includes('/view')) {
      finalUrl = url.replace('/view', '/preview');
    }
    this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl));
    this.isPreviewVisible.set(true);
  }

  closePreview(): void {
    this.isPreviewVisible.set(false);
    this.previewUrl.set(null);
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
    this.addMode.set('select');
    this.selectedGlobalSubjectId.set(null);
    this.addForm.reset();
    this.addMaterials.clear();
    this.isAddModalVisible.set(true);
  }

  toggleAddMode() {
    this.addMode.set(this.addMode() === 'select' ? 'create' : 'select');
  }

  handleAddCancel(): void {
    this.isAddModalVisible.set(false);
  }

  handleAddSubmit(): void {
    if (this.addMode() === 'select') {
      const id = this.selectedGlobalSubjectId();
      if (id) {
        const subjectToAdd = this.globalSubjects().find(s => s.id === id);
        if (subjectToAdd) {
          this.mySubjects.update(list => [...list, JSON.parse(JSON.stringify(subjectToAdd))]);
          this.saveMySubjects();
          this.message.success('Materia a fost adăugată în lista ta!');
          this.isAddModalVisible.set(false);
        }
      } else {
        this.message.error('Vă rugăm să selectați o materie din catalog.');
      }
    } else {
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

        this.subjectService.addGlobalSubject(newSubject as Subject).subscribe({
          next: (createdGlobal) => {
            this.subjectService.getGlobalSubjects().subscribe(globals => this.globalSubjects.set(globals));
            
            this.mySubjects.update(list => [...list, JSON.parse(JSON.stringify(createdGlobal))]);
            this.saveMySubjects();

            this.message.success('Materia a fost creată și adăugată în catalog!');
            this.isAddModalVisible.set(false);
          },
          error: (err) => {
            console.error('Error adding subject:', err);
            this.message.error('Eroare la crearea materiei. Verificați dacă serverul (json-server) rulează.');
          }
        });
      } else {
        Object.values(this.addForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      }
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

    this.editMaterials.clear();
    if (subject.materials && subject.materials.length > 0) {
      subject.materials.forEach(mat => {
        this.editMaterials.push(this.fb.group({
          name: [mat.name, Validators.required],
          url: [mat.url, Validators.required]
        }));
      });
    }

    this.editForm.patchValue({
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
        const editValues = this.editForm.getRawValue();
        
        // 1. Actualizare detalii personale (rating-uri, comentarii) pe contul local
        this.mySubjects.update(list => list.map(s => s.id === id ? { ...s, ...editValues } : s));
        this.saveMySubjects();
        
        // 2. Sincronizare materiale cu catalogul global pentru a apărea la toți
        const globalSubject = this.globalSubjects().find(s => s.id === id);
        if (globalSubject) {
          const updatedGlobal = { ...globalSubject, materials: editValues.materials };
          this.subjectService.updateGlobalSubject(updatedGlobal).subscribe(() => {
            this.globalSubjects.update(list => list.map(s => s.id === id ? updatedGlobal : s));
          });
        }

        this.message.success('Materia a fost actualizată!');
      }
      this.isEditModalVisible.set(false);
      this.editingSubjectId.set(null);
    }
  }

  removeSubjectFromList(id: number | undefined): void {
    if (id) {
      this.mySubjects.update(list => list.filter(s => s.id !== id));
      this.saveMySubjects();
      this.message.success('Materia a fost eliminată din lista ta!');
    }
  }

  getAverageProfessorRating(subject: Subject): number {
    const globalRating = subject.globalProfessorRating || 0;
    const personalRating = subject.professorRating || 0;
    
    if (personalRating > 0 && globalRating > 0) {
      return (globalRating + personalRating) / 2;
    }
    return personalRating > 0 ? personalRating : globalRating;
  }

  getAverageExamRating(subject: Subject): number {
    const globalRating = subject.globalExamRating || 0;
    const personalRating = subject.examRating || 0;
    
    if (personalRating > 0 && globalRating > 0) {
      return (globalRating + personalRating) / 2;
    }
    return personalRating > 0 ? personalRating : globalRating;
  }

  addGlobalComment(): void {
    const text = this.newCommentText().trim();
    if (!text) return;

    const subjectId = this.editingSubjectId();
    if (!subjectId) return;

    const globalVer = this.globalSubjects().find(g => g.id === subjectId);
    if (!globalVer) return;

    const user = this.currentUser();
    const newComment = {
      username: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
      text: text,
      date: new Date().toISOString()
    };

    const updatedGlobal = {
      ...globalVer,
      globalComments: [...(globalVer.globalComments || []), newComment]
    };

    this.subjectService.updateGlobalSubject(updatedGlobal).subscribe(() => {
      this.globalSubjects.update(list => list.map(s => s.id === updatedGlobal.id ? updatedGlobal : s));
      this.newCommentText.set('');
    });
  }
}
