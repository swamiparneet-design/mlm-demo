import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ZoneService } from '../../../core/services/zone.service';
import { AdminUserSummary, PlacementTreeNode } from '../../../core/models/user.model';
import { Zone } from '../../../core/models/zone.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { PlacementTreeNodeComponent } from '../../../shared/components/placement-tree/placement-tree-node.component';

function countDescendants(node: PlacementTreeNode | null): number {
  if (!node) return 0;
  let count = 0;
  for (const child of node.children) count += 1 + countDescendants(child);
  return count;
}

@Component({
  selector: 'app-placement-trees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    EmptyStateComponent,
    InputComponent,
    SkeletonComponent,
    PlacementTreeNodeComponent,
  ],
  templateUrl: './placement-trees.component.html',
})
export class PlacementTreesComponent {
  private readonly adminService = inject(AdminService);
  private readonly zoneService = inject(ZoneService);

  readonly loading = signal(true);
  readonly users = signal<AdminUserSummary[]>([]);
  readonly zones = signal<Zone[]>([]);
  readonly search = signal('');
  readonly selectedUser = signal<AdminUserSummary | null>(null);
  readonly selectedZoneId = signal<number | null>(null);
  readonly tree = signal<PlacementTreeNode | null>(null);
  readonly treeLoading = signal(false);

  readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.users().filter((u) => u.role === 'User');
    if (!term) return list.slice(0, 8);
    return list.filter((u) => u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)).slice(0, 8);
  });

  readonly teamSize = computed(() => countDescendants(this.tree()));
  readonly treeTitle = computed(() => {
    const user = this.selectedUser();
    return user ? `${user.fullName}'s downline` : '';
  });

  constructor() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.selectedZoneId.set(zones[0]?.id ?? null);
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
  }

  selectUser(user: AdminUserSummary): void {
    this.selectedUser.set(user);
    this.loadTree();
  }

  selectZone(zoneId: number): void {
    this.selectedZoneId.set(zoneId);
    this.loadTree();
  }

  private loadTree(): void {
    const user = this.selectedUser();
    const zoneId = this.selectedZoneId();
    if (!user || !zoneId) return;

    this.treeLoading.set(true);
    this.tree.set(null);
    this.adminService.getUserPlacementTree(user.id, zoneId).subscribe({
      next: (tree) => {
        this.tree.set(tree);
        this.treeLoading.set(false);
      },
      error: () => this.treeLoading.set(false),
    });
  }

  private loadedCount = 0;
  private checkDone(): void {
    this.loadedCount += 1;
    if (this.loadedCount >= 2) this.loading.set(false);
  }
}
