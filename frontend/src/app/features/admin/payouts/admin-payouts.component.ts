import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ZoneService } from '../../../core/services/zone.service';
import { PayoutStatus, PayoutTransaction } from '../../../core/models/payout.model';
import { Zone } from '../../../core/models/zone.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-admin-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, CardComponent, EmptyStateComponent, SkeletonComponent, TableComponent],
  templateUrl: './admin-payouts.component.html',
})
export class AdminPayoutsComponent {
  private readonly adminService = inject(AdminService);
  private readonly zoneService = inject(ZoneService);

  readonly loading = signal(true);
  readonly payouts = signal<PayoutTransaction[]>([]);
  readonly zones = signal<Zone[]>([]);

  readonly zoneFilter = signal<string>('all');
  readonly statusFilter = signal<'all' | PayoutStatus>('all');
  readonly fromDate = signal<string>('');
  readonly toDate = signal<string>('');

  readonly filtered = computed(() => {
    const zone = this.zoneFilter();
    const status = this.statusFilter();
    const from = this.fromDate();
    const to = this.toDate();

    return this.payouts().filter((p) => {
      if (zone !== 'all' && p.zoneName !== zone) return false;
      if (status !== 'all' && p.status !== status) return false;
      const created = new Date(p.createdAt).getTime();
      if (from && created < new Date(from).getTime()) return false;
      if (to && created > new Date(to).getTime() + 86400000) return false;
      return true;
    });
  });

  readonly totalGross = computed(() => this.filtered().reduce((sum, p) => sum + p.grossAmount, 0));
  readonly totalRetention = computed(() => this.filtered().reduce((sum, p) => sum + p.retentionAmount, 0));
  readonly totalNet = computed(() => this.filtered().reduce((sum, p) => sum + p.netPayoutAmount, 0));

  constructor() {
    this.adminService.getAllPayouts().subscribe({
      next: (payouts) => {
        this.payouts.set(payouts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.zoneService.getAll().subscribe({ next: (zones) => this.zones.set(zones) });
  }

  badgeVariant(status: string): 'emerald' | 'gold' | 'red' {
    return status === 'Completed' ? 'emerald' : status === 'Pending' ? 'gold' : 'red';
  }

  resetFilters(): void {
    this.zoneFilter.set('all');
    this.statusFilter.set('all');
    this.fromDate.set('');
    this.toDate.set('');
  }
}
