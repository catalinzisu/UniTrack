import { Component, computed, inject, signal, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzCardModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzGridModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  user = this.authService.currentUser;
  subjectsCount = signal<number>(0);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.subjectService.getUserSubjects(user.email).subscribe({
          next: (personal) => {
            if (personal) {
              this.subjectsCount.set(personal.length);
            } else {
              this.subjectService.getGlobalSubjects().subscribe(globals => {
                const count = globals.filter(s => 
                  s.faculty === user.faculty && 
                  s.specialization === user.specialization && 
                  String(s.studyYear) === String(user.studyYear)
                ).length;
                this.subjectsCount.set(count);
              });
            }
          }
        });
      } else {
        this.subjectsCount.set(0);
      }
    }, { allowSignalWrites: true });
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
