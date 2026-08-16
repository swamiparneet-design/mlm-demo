import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardSummary } from '../../../core/models/dashboard.model';
import { AdminUserSummary } from '../../../core/models/user.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/charts/chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, SkeletonComponent, EmptyStateComponent, StatCardComponent, ChartComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly users = signal<AdminUserSummary[]>([]);

  readonly zoneDistribution = computed(() => {
    const counts = new Map<string, number>();
    for (const user of this.users()) {
      const zone = user.currentZoneName ?? 'Unassigned';
      counts.set(zone, (counts.get(zone) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([zoneName, count]) => ({ zoneName, count }));
  });

  readonly hasEnoughData = computed(() => this.users().length >= 3);

  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.zoneDistribution().map((z) => z.zoneName),
    datasets: [
      {
        label: 'Users',
        data: this.zoneDistribution().map((z) => z.count),
        backgroundColor: ['#059669', '#D97706', '#0F172A', '#64748b'],
        borderRadius: 8,
        maxBarThickness: 56,
      },
    ],
  }));

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  constructor() {
    this.adminService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users.filter((u) => u.role === 'User'));
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
  }

  private loadedCount = 0;
  private checkDone(): void {
    this.loadedCount += 1;
    if (this.loadedCount >= 2) this.loading.set(false);
  }
}
