import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MeService } from '../../../core/services/me.service';
import { PlacementTreeNode, UserZoneProgress } from '../../../core/models/user.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PlacementTreeNodeComponent } from '../../../shared/components/placement-tree/placement-tree-node.component';

function countDescendants(node: PlacementTreeNode | null): number {
  if (!node) return 0;
  let count = 0;
  for (const child of node.children) {
    count += 1 + countDescendants(child);
  }
  return count;
}

function maxDepth(node: PlacementTreeNode | null): number {
  if (!node || node.children.length === 0) return node ? 1 : 0;
  return 1 + Math.max(...node.children.map(maxDepth));
}

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, CardComponent, SkeletonComponent, EmptyStateComponent, PlacementTreeNodeComponent],
  templateUrl: './my-team.component.html',
})
export class MyTeamComponent {
  private readonly meService = inject(MeService);

  readonly loading = signal(true);
  readonly zones = signal<UserZoneProgress[]>([]);
  readonly selectedZoneId = signal<number | null>(null);
  readonly tree = signal<PlacementTreeNode | null>(null);
  readonly treeLoading = signal(false);

  readonly teamSize = computed(() => countDescendants(this.tree()));
  readonly depth = computed(() => maxDepth(this.tree()));

  constructor() {
    this.meService.getZoneProgress().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        const preferred = zones.find((z) => z.status === 'InProgress') ?? zones[0];
        if (preferred) {
          this.selectZone(preferred.zoneId);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectZone(zoneId: number): void {
    this.selectedZoneId.set(zoneId);
    this.treeLoading.set(true);
    this.tree.set(null);
    this.meService.getPlacementTree(zoneId).subscribe({
      next: (tree) => {
        this.tree.set(tree);
        this.treeLoading.set(false);
      },
      error: () => this.treeLoading.set(false),
    });
  }
}
