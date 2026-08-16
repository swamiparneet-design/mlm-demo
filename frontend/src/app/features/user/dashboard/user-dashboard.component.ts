import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeService } from '../../../core/services/me.service';
import { PayoutTransaction } from '../../../core/models/payout.model';
import { PlacementTreeNode, UserZoneProgress } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

function countDescendants(node: PlacementTreeNode | null): number {
  if (!node) return 0;
  let count = 0;
  for (const child of node.children) {
    count += 1 + countDescendants(child);
  }
  return count;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    CardComponent,
    SkeletonComponent,
    EmptyStateComponent,
    StatCardComponent,
  ],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent {
  private readonly meService = inject(MeService);

  readonly loading = signal(true);
  readonly progress = signal<UserZoneProgress[]>([]);
  readonly payouts = signal<PayoutTransaction[]>([]);
  readonly teamSize = signal(0);

  readonly activeProgress = computed<UserZoneProgress | null>(() => {
    const list = this.progress();
    return list.find((p) => p.status === 'InProgress') ?? list[list.length - 1] ?? null;
  });

  readonly totalEarned = computed(() =>
    this.payouts()
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.netPayoutAmount, 0),
  );

  readonly recentPayouts = computed(() => this.payouts().slice(0, 5));

  readonly placementsRemaining = computed(() => {
    const p = this.activeProgress();
    if (!p) return 0;
    return Math.max(0, p.requiredPlacementCount - p.currentPlacementCount);
  });

  readonly referralsRemaining = computed(() => {
    const p = this.activeProgress();
    if (!p) return 0;
    return Math.max(0, p.requiredReferralCount - p.currentReferralCount);
  });

  constructor() {
    this.meService.getZoneProgress().subscribe({
      next: (progress) => {
        this.progress.set(progress);
        const active = progress.find((p) => p.status === 'InProgress') ?? progress[progress.length - 1];
        if (active) {
          this.meService.getPlacementTree(active.zoneId).subscribe({
            next: (tree) => this.teamSize.set(countDescendants(tree)),
          });
        }
        this.checkDone();
      },
      error: () => this.checkDone(),
    });

    this.meService.getPayoutHistory().subscribe({
      next: (payouts) => {
        this.payouts.set(payouts);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
  }

  private loadedCount = 0;
  private checkDone(): void {
    this.loadedCount += 1;
    if (this.loadedCount >= 2) {
      this.loading.set(false);
    }
  }
}
