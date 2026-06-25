import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, throwError, map, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  
  public currentUser: WritableSignal<User | null> = signal(null);

  constructor(private http: HttpClient) {
    try {
      // Check both storages for an active session
      let activeUserStr = localStorage.getItem('active_user_session');
      if (!activeUserStr) {
        activeUserStr = sessionStorage.getItem('active_user_session');
      }
      
      if (activeUserStr) {
        this.currentUser.set(JSON.parse(activeUserStr));
      }
    } catch(e) {
      console.error('Failed to restore active user', e);
    }
  }

  register(userData: any): Observable<any> {
    const userToCreate = {
      ...userData,
      id: userData.email, // Folosim email-ul ca ID pentru a fi compatibil cu db.json existent
      subjects: []
    };

    return this.http.get<any[]>(`${this.apiUrl}?id=${userData.email}`).pipe(
      switchMap((users) => {
        // Verificăm dacă email-ul există deja
        if (users.length > 0) {
          return throwError(() => new Error('Acest email este deja înregistrat!'));
        }
        return this.http.post(this.apiUrl, userToCreate).pipe(
          map(() => ({ success: true }))
        );
      })
    );
  }

  login(credentials: { email: string; password?: string; remember?: boolean }): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?id=${credentials.email}`).pipe(
      tap((users) => {
        if (users.length === 0) {
          throw new Error('Contul nu există. Te rugăm să te înregistrezi mai întâi.');
        }
        
        const foundUser = users[0];
        
        if (foundUser.password !== credentials.password) {
          throw new Error('Parolă incorectă!');
        }

        // Succes
        const activeUser: User = {
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          faculty: foundUser.faculty,
          specialization: foundUser.specialization,
          studyYear: foundUser.studyYear
        };

        this.currentUser.set(activeUser);
        const token = 'mock_token_' + Date.now();
        const userStr = JSON.stringify(activeUser);

        if (credentials.remember) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('active_user_session', userStr);
        } else {
          sessionStorage.setItem('auth_token', token);
          sessionStorage.setItem('active_user_session', userStr);
        }
      }),
      map(() => ({ token: 'mock_token_' + Date.now() }))
    );
  }

  updateProfile(updatedUser: User): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${encodeURIComponent(updatedUser.email)}`, updatedUser).pipe(
      tap(() => {
        this.currentUser.set(updatedUser);
        
        if (localStorage.getItem('active_user_session')) {
          localStorage.setItem('active_user_session', JSON.stringify(updatedUser));
        } else if (sessionStorage.getItem('active_user_session')) {
          sessionStorage.setItem('active_user_session', JSON.stringify(updatedUser));
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('active_user_session');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('active_user_session');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null || !!localStorage.getItem('auth_token') || !!sessionStorage.getItem('auth_token');
  }
}
