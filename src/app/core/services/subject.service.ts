import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Subject } from '../models/subject.model';
import { MOCK_SUBJECTS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private subjectsSignal: WritableSignal<Subject[]>;

  constructor() {
    const saved = localStorage.getItem('unitrack_subjects');
    if (saved) {
      this.subjectsSignal = signal(JSON.parse(saved));
    } else {
      this.subjectsSignal = signal(MOCK_SUBJECTS);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('unitrack_subjects', JSON.stringify(this.subjectsSignal()));
  }

  getSubjectsForUser(faculty: string, specialization: string, studyYear: string | number) {
    return computed(() => {
      return this.subjectsSignal().filter(s => 
        s.faculty === faculty && 
        s.specialization === specialization && 
        String(s.studyYear) === String(studyYear)
      );
    });
  }

  addSubject(subject: Subject) {
    const newSubject = { ...subject, id: Date.now() };
    this.subjectsSignal.update(subjects => [...subjects, newSubject as any]);
    this.saveToStorage();
  }

  deleteSubject(id: number | string) {
    this.subjectsSignal.update(subjects => subjects.filter(s => String(s.id) !== String(id)));
    this.saveToStorage();
  }

  updateSubject(id: number | string, changes: Partial<Subject>) {
    this.subjectsSignal.update(subjects => 
      subjects.map(s => String(s.id) === String(id) ? { ...s, ...changes } : s)
    );
    this.saveToStorage();
  }
}
