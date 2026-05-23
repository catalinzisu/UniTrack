import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzDescriptionsModule, NzIconModule],
  template: `
    <nz-card nzTitle="My Profile">
      <nz-descriptions nzBordered [nzColumn]="1">
        <nz-descriptions-item nzTitle="First Name">{{ user?.firstName }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Last Name">{{ user?.lastName }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Email">{{ user?.email }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Faculty">{{ user?.faculty }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Specialization">{{ user?.specialization }}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="Study Year">{{ user?.studyYear }}</nz-descriptions-item>
      </nz-descriptions>
    </nz-card>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser();
}
