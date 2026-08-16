import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MeService } from '../../../core/services/me.service';
import { UserReferral } from '../../../core/models/user.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-my-referrals',
  standalone: true,
  imports: [CommonModule, CardComponent, TableComponent, SkeletonComponent, EmptyStateComponent, BadgeComponent],
  templateUrl: './my-referrals.component.html',
})
export class MyReferralsComponent {
  private readonly meService = inject(MeService);

  readonly loading = signal(true);
  readonly referrals = signal<UserReferral[]>([]);

  constructor() {
    this.meService.getReferrals().subscribe({
      next: (referrals) => {
        this.referrals.set(referrals);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
