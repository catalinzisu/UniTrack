import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { User } from '../models/user.model';
import { MOCK_USER } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://reqres.in/api/login';
  
  // Signal care tine datele utilizatorului logat (null daca nu e logat)
  public currentUser: WritableSignal<User | null> = signal(null);

  constructor(private http: HttpClient) {
    try {
      const activeUserStr = localStorage.getItem('active_user_session');
      const registeredUserStr = localStorage.getItem('registered_user');
      
      if (activeUserStr) {
        this.currentUser.set(JSON.parse(activeUserStr));
      } else if (localStorage.getItem('auth_token')) {
        // Fallback pentru sesiuni vechi care au doar token-ul salvat
        if (registeredUserStr) {
          this.currentUser.set(JSON.parse(registeredUserStr));
        } else {
          this.currentUser.set(MOCK_USER);
        }
      }
    } catch(e) {
      console.error('Failed to restore active user', e);
      if (localStorage.getItem('auth_token')) {
        this.currentUser.set(MOCK_USER);
      }
    }
  }

  login(credentials: { email: string; password?: string }): Observable<any> {
    // Încercăm să luăm datele înregistrate anterior în browser, altfel folosim MOCK_USER
    let userDetails: User = MOCK_USER;
    try {
      const registeredUserStr = localStorage.getItem('registered_user');
      if (registeredUserStr) {
        const registeredUser = JSON.parse(registeredUserStr);
        // Daca email-ul se potriveste, folosim datele introduse la inregistrare
        if (registeredUser.email === credentials.email) {
          userDetails = registeredUser;
        }
      }
    } catch (e) {
      console.error('Error reading registered user', e);
    }

    // Deoarece reqres.in solicită acum cheie API (x-api-key), simulam apelul HTTP local
    // cu un delay de 800ms pentru a fi 100% robust, offline-friendly si functional.
    return of({ token: 'QpwL5tke4Pnpja7X4' }).pipe(
      delay(800),
      tap((response) => {
        if (response && response.token) {
          // Salvam in state datele reale ale utilizatorului
          const activeUser = {
            ...userDetails,
            email: credentials.email
          };
          this.currentUser.set(activeUser);
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('active_user_session', JSON.stringify(activeUser));
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('active_user_session');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null || !!localStorage.getItem('auth_token');
  }
}
