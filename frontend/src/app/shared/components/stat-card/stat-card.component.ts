import { Component, input } from '@angular/core';

export type StatCardTone = 'navy' | 'emerald' | 'gold' | 'slate';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="rounded-2xl p-5 shadow-soft border border-slate-100 relative overflow-hidden" [class]="bgClass()">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium" [class]="labelClass()">{{ label() }}</p>
          <p class="text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight" [class]="valueClass()">{{ value() }}</p>
          @if (trend()) {
            <p class="text-xs font-medium mt-2 inline-flex items-center gap-1" [class]="trendClass()">
              {{ trend() }}
            </p>
          }
        </div>
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" [class]="iconWrapClass()">
          <span [innerHTML]="icon()"></span>
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly trend = input<string>('');
  readonly trendPositive = input(true);
  readonly tone = input<StatCardTone>('slate');
  readonly icon = input<string>(
    '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>',
  );

  bgClass(): string {
    return {
      navy: 'bg-navy-900',
      emerald: 'bg-gradient-to-br from-brand-50 to-white',
      gold: 'bg-gradient-to-br from-gold-50 to-white',
      slate: 'bg-white',
    }[this.tone()];
  }

  labelClass(): string {
    return this.tone() === 'navy' ? 'text-navy-200' : 'text-slate-500';
  }

  valueClass(): string {
    return this.tone() === 'navy' ? 'text-white' : 'text-slate-900';
  }

  iconWrapClass(): string {
    return {
      navy: 'bg-white/10 text-white',
      emerald: 'bg-brand-100 text-brand-700',
      gold: 'bg-gold-100 text-gold-700',
      slate: 'bg-slate-100 text-slate-600',
    }[this.tone()];
  }

  trendClass(): string {
    const trend = this.trend();
    if (!trend || trend === '-') return 'text-slate-400';
    if (trend.startsWith('-')) return 'text-red-600';
    if (trend.startsWith('+')) return 'text-brand-600';
    return this.trendPositive() ? 'text-brand-600' : 'text-red-600';
  }
}
