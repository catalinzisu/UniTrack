import { Component, OnInit, computed, inject } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  user: any;

  subjectsCount = computed(() => {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      const personal = this.subjectService.getUserSubjects(currentUser.email);
      if (personal) {
        return personal.length;
      }
      
      const globals = this.subjectService.getGlobalSubjects();
      return globals.filter(s => 
        s.faculty === currentUser.faculty && 
        s.specialization === currentUser.specialization && 
        String(s.studyYear) === String(currentUser.studyYear)
      ).length;
    }
    return 0;
  });

  ngOnInit() {
    this.user = this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
