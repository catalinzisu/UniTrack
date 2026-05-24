import { Injectable } from '@angular/core';
import { Subject } from '../models/subject.model';
import { MOCK_SUBJECTS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  constructor() {}

  getGlobalSubjects(): Subject[] {
    const saved = localStorage.getItem('unitrack_global_subjects');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with mock
    localStorage.setItem('unitrack_global_subjects', JSON.stringify(MOCK_SUBJECTS));
    return MOCK_SUBJECTS;
  }

  saveGlobalSubjects(subjects: Subject[]): void {
    localStorage.setItem('unitrack_global_subjects', JSON.stringify(subjects));
  }

  addGlobalSubject(subject: Subject): Subject {
    const globals = this.getGlobalSubjects();
    const newSubject = { ...subject, id: Date.now() };
    globals.push(newSubject as Subject);
    this.saveGlobalSubjects(globals);
    return newSubject as Subject;
  }

  getUserSubjects(email: string): Subject[] | null {
    const saved = localStorage.getItem(`unitrack_user_subjects_${email}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  saveUserSubjects(email: string, subjects: Subject[]): void {
    localStorage.setItem(`unitrack_user_subjects_${email}`, JSON.stringify(subjects));
  }
}
