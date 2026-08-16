import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ZoneService } from '../../../core/services/zone.service';
import { AdminUserSummary, PlacementTreeNode } from '../../../core/models/user.model';
import { PayoutTransaction } from '../../../core/models/payout.model';
import { Zone } from '../../../core/models/zone.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { PlacementTreeNodeComponent } from '../../../shared/components/placement-tree/placement-tree-node.component';

function countDescendants(node: PlacementTreeNode | null): number {
  if (!node) return 0;
  let count = 0;
  for (const child of node.children) count += 1 + countDescendants(child);
  return count;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    CardComponent,
    EmptyStateComponent,
    SkeletonComponent,
    PlacementTreeNodeComponent,
  ],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly zoneService = inject(ZoneService);

  readonly userId = Number(this.route.snapshot.paramMap.get('id'));
  readonly loading = signal(true);
  readonly user = signal<AdminUserSummary | null>(null);
  readonly zones = signal<Zone[]>([]);
  readonly selectedZoneId = signal<number | null>(null);
  readonly tree = signal<PlacementTreeNode | null>(null);
  readonly treeLoading = signal(false);
  readonly payouts = signal<PayoutTransaction[]>([]);

  readonly teamSize = computed(() => countDescendants(this.tree()));
  readonly userPayouts = computed(() => this.payouts().filter((p) => p.userId === this.userId));
  readonly totalEarned = computed(() =>
    this.userPayouts()
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.netPayoutAmount, 0),
  );

  constructor() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        const found = users.find((u) => u.id === this.userId) ?? null;
        this.user.set(found);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });

    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        const preferred = zones[0];
        if (preferred) this.selectZone(preferred.id);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });

    this.adminService.getAllPayouts().subscribe({
      next: (payouts) => {
        this.payouts.set(payouts);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
  }

  selectZone(zoneId: number): void {
    this.selectedZoneId.set(zoneId);
    this.treeLoading.set(true);
    this.tree.set(null);
    this.adminService.getUserPlacementTree(this.userId, zoneId).subscribe({
      next: (tree) => {
        this.tree.set(tree);
        this.treeLoading.set(false);
      },
      error: () => this.treeLoading.set(false),
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/users');
  }

  private loadedCount = 0;
  private checkDone(): void {
    this.loadedCount += 1;
    if (this.loadedCount >= 3) this.loading.set(false);
  }
}
