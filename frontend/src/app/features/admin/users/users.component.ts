import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUserSummary } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeComponent,
    CardComponent,
    EmptyStateComponent,
    InputComponent,
    SkeletonComponent,
    TableComponent,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly users = signal<AdminUserSummary[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly statusOptions: ('all' | 'active' | 'inactive')[] = ['all', 'active', 'inactive'];

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.users().filter((u) => {
      const matchesSearch =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.mobile.includes(term);
      const matchesStatus = status === 'all' || (status === 'active' ? u.isActive : !u.isActive);
      return matchesSearch && matchesStatus;
    });
  });

  constructor() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openUser(user: AdminUserSummary): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }
}
