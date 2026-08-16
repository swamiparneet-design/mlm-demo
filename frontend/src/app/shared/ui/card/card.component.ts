import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="classes()">
      @if (title()) {
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="text-sm text-slate-500 mt-0.5">{{ subtitle() }}</p>
            }
          </div>
          <ng-content select="[cardActions]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly hover = input(false);

  classes(): string {
    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };
    const base = 'bg-white rounded-2xl shadow-soft border border-slate-100';
    const hover = this.hover() ? ' transition-smooth duration-200 hover:shadow-soft-lg hover:-translate-y-0.5' : '';
    return `${base}${hover} ${paddings[this.padding()]}`;
  }
}
