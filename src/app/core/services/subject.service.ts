import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, throwError } from 'rxjs';
import { Subject } from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  constructor() {}

  getGlobalSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/globalSubjects`);
  }

  addGlobalSubject(subject: Subject): Observable<Subject> {
    const newSubject = { ...subject, id: Date.now() };
    return this.http.post<Subject>(`${this.apiUrl}/globalSubjects`, newSubject);
  }

  updateGlobalSubject(subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/globalSubjects/${subject.id}`, subject);
  }

  getUserSubjects(email: string): Observable<Subject[] | null> {
    return this.http.get<{id: string, subjects: Subject[]}>(`${this.apiUrl}/users/${encodeURIComponent(email)}`).pipe(
      map(user => user.subjects),
      catchError(err => {
        if (err.status === 404) return of(null);
        return throwError(() => err);
      })
    );
  }

  saveUserSubjects(email: string, subjects: Subject[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${encodeURIComponent(email)}`, {
      id: email,
      subjects: subjects
    }).pipe(
      catchError(err => {
        if (err.status === 404) {
          // Creare resursă dacă nu există (POST)
          return this.http.post(`${this.apiUrl}/users`, {
            id: email,
            subjects: subjects
          });
        }
        return throwError(() => err);
      })
    );
  }
}
