import { Component, computed, input } from '@angular/core';

export type ProgressColor = 'emerald' | 'gold' | 'navy';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div>
      @if (label() || showValue()) {
        <div class="flex items-center justify-between mb-1.5 text-sm">
          <span class="font-medium text-slate-700">{{ label() }}</span>
          @if (showValue()) {
            <span class="text-slate-500 font-medium">{{ value() }} / {{ max() }}</span>
          }
        </div>
      }
      <div class="w-full rounded-full bg-slate-100 overflow-hidden" [class]="heightClass()">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          [class]="barColorClass()"
          [style.width.%]="percent()"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly max = input(100);
  readonly label = input<string>('');
  readonly showValue = input(true);
  readonly color = input<ProgressColor>('emerald');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly percent = computed(() => {
    const max = this.max();
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.max(0, (this.value() / max) * 100));
  });

  heightClass(): string {
    return { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }[this.size()];
  }

  barColorClass(): string {
    return {
      emerald: 'bg-gradient-to-r from-brand-500 to-brand-600',
      gold: 'bg-gradient-to-r from-gold-500 to-gold-600',
      navy: 'bg-gradient-to-r from-navy-700 to-navy-900',
    }[this.color()];
  }
}
