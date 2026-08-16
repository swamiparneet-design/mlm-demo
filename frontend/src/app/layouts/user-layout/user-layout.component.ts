import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MeService } from '../../core/services/me.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ToastContainerComponent } from '../../shared/ui/toast/toast-container.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    route: '/app/dashboard',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />',
  },
  {
    label: 'My Team',
    route: '/app/my-team',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />',
  },
  {
    label: 'My Referrals',
    route: '/app/my-referrals',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />',
  },
  {
    label: 'Payout History',
    route: '/app/payouts',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />',
  },
  {
    label: 'Profile',
    route: '/app/profile',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />',
  },
];

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BadgeComponent, ToastContainerComponent],
  templateUrl: './user-layout.component.html',
})
export class UserLayoutComponent {
  protected readonly auth = inject(AuthService);
  private readonly meService = inject(MeService);

  readonly navItems = NAV_ITEMS;
  readonly mobileMenuOpen = signal(false);
  readonly currentZone = signal<string>('');
  readonly currentStage = signal<string>('');

  constructor() {
    this.meService.getZoneProgress().subscribe({
      next: (progress) => {
        const active = progress.find((p) => p.status === 'InProgress') ?? progress[progress.length - 1];
        if (active) {
          this.currentZone.set(active.zoneName);
          this.currentStage.set(active.stageName);
        }
      },
    });
  }

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }

  initials(): string {
    const name = this.auth.currentUser()?.fullName ?? '';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}
