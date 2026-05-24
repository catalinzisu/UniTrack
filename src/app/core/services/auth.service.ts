import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, delay, of, catchError, timer, switchMap, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://reqres.in/api/login';
  
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

  // Get the array of registered users
  private getRegisteredUsers(): any[] {
    try {
      const usersStr = localStorage.getItem('registered_users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch(e) {
      return [];
    }
  }

  register(userData: any): Observable<any> {
    return timer(800).pipe(
      switchMap(() => {
        const users = this.getRegisteredUsers();
        // Verificăm dacă email-ul există deja
        if (users.find(u => u.email === userData.email)) {
          return throwError(() => new Error('Acest email este deja înregistrat!'));
        }
        users.push(userData);
        localStorage.setItem('registered_users', JSON.stringify(users));
        return of({ success: true });
      })
    );
  }

  login(credentials: { email: string; password?: string; remember?: boolean }): Observable<any> {
    // Facem un request HTTP real către Fake API
    return this.http.post(this.apiUrl, { email: credentials.email, password: credentials.password || 'password' }).pipe(
      // ReqRes va da eroare 400 dacă user-ul nu e "eve.holt@reqres.in". 
      // Noi prindem eroarea și simulăm un succes local ca să nu stricăm fluxul aplicației (pentru datele custom ale studenților)
      catchError(() => of({ token: 'mock_token_fallback' }).pipe(delay(400))),
      tap((response: any) => {
        const users = this.getRegisteredUsers();
        const foundUser = users.find(u => u.email === credentials.email);
        
        if (!foundUser) {
          throw new Error('Contul nu există. Te rugăm să te înregistrezi mai întâi.');
        }

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
        const token = response.token || 'mock_token_' + Date.now();
        const userStr = JSON.stringify(activeUser);

        if (credentials.remember) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('active_user_session', userStr);
        } else {
          sessionStorage.setItem('auth_token', token);
          sessionStorage.setItem('active_user_session', userStr);
        }
      })
    );
  }

  updateProfile(updatedUser: User): Observable<any> {
    return timer(500).pipe(
      tap(() => {
        const users = this.getRegisteredUsers();
        const index = users.findIndex((u: any) => u.email === updatedUser.email);
        if (index > -1) {
          users[index] = { ...users[index], ...updatedUser };
          localStorage.setItem('registered_users', JSON.stringify(users));
          
          this.currentUser.set(updatedUser);
          
          if (localStorage.getItem('active_user_session')) {
            localStorage.setItem('active_user_session', JSON.stringify(updatedUser));
          } else if (sessionStorage.getItem('active_user_session')) {
            sessionStorage.setItem('active_user_session', JSON.stringify(updatedUser));
          }
        } else {
          throw new Error('User not found');
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
