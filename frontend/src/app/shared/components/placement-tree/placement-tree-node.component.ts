import { Component, input, signal } from '@angular/core';
import { PlacementTreeNode } from '../../../core/models/user.model';
import { BadgeComponent } from '../../ui/badge/badge.component';

@Component({
  selector: 'app-placement-tree-node',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div>
      <div class="flex items-center gap-2.5 py-2 group">
        @if (node().children.length > 0) {
          <button
            type="button"
            class="w-6 h-6 shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-smooth"
            (click)="expanded.set(!expanded())"
            [attr.aria-label]="expanded() ? 'Collapse' : 'Expand'"
          >
            <svg
              class="w-4 h-4 transition-transform duration-150"
              [class.rotate-90]="expanded()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        } @else {
          <span class="w-6 h-6 shrink-0 flex items-center justify-center">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </span>
        }

        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          [class]="depth() === 0 ? 'bg-navy-900 text-white' : 'bg-brand-100 text-brand-700'"
        >
          {{ initials() }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ node().fullName }}</p>
            @if (node().stageName) {
              <app-badge variant="emerald" size="sm">{{ node().stageName }}</app-badge>
            }
          </div>
          <p class="text-xs text-slate-500 truncate">{{ node().email }}</p>
        </div>

        @if (node().children.length > 0) {
          <span class="text-xs font-medium text-slate-400 shrink-0 pr-1">{{ node().children.length }} direct</span>
        }
      </div>

      @if (expanded() && node().children.length > 0) {
        <div class="ml-3 pl-4 border-l-2 border-slate-100 space-y-0">
          @for (child of node().children; track child.userId) {
            <app-placement-tree-node [node]="child" [depth]="depth() + 1" />
          }
        </div>
      }
    </div>
  `,
})
export class PlacementTreeNodeComponent {
  readonly node = input.required<PlacementTreeNode>();
  readonly depth = input(0);

  readonly expanded = signal(true);

  initials(): string {
    const parts = this.node().fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
