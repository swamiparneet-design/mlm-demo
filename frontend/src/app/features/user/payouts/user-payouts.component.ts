import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MeService } from '../../../core/services/me.service';
import { PayoutTransaction } from '../../../core/models/payout.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-user-payouts',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CardComponent, EmptyStateComponent, SkeletonComponent, TableComponent],
  templateUrl: './user-payouts.component.html',
})
export class UserPayoutsComponent {
  private readonly meService = inject(MeService);

  readonly loading = signal(true);
  readonly payouts = signal<PayoutTransaction[]>([]);

  readonly totalGross = computed(() => this.payouts().reduce((sum, p) => sum + p.grossAmount, 0));
  readonly totalRetention = computed(() => this.payouts().reduce((sum, p) => sum + p.retentionAmount, 0));
  readonly totalNet = computed(() => this.payouts().reduce((sum, p) => sum + p.netPayoutAmount, 0));

  constructor() {
    this.meService.getPayoutHistory().subscribe({
      next: (payouts) => {
        this.payouts.set(payouts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  badgeVariant(status: string): 'emerald' | 'gold' | 'red' {
    return status === 'Completed' ? 'emerald' : status === 'Pending' ? 'gold' : 'red';
  }
}
