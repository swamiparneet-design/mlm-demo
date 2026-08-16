import { Component, input } from '@angular/core';

export type BadgeVariant = 'emerald' | 'gold' | 'navy' | 'gray' | 'red' | 'blue';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('gray');
  readonly size = input<'sm' | 'md'>('md');
  readonly dot = input(false);

  classes(): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset';
    const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };
    const variants: Record<BadgeVariant, string> = {
      emerald: 'bg-brand-50 text-brand-700 ring-brand-200',
      gold: 'bg-gold-50 text-gold-700 ring-gold-200',
      navy: 'bg-navy-50 text-navy-700 ring-navy-200',
      gray: 'bg-slate-100 text-slate-600 ring-slate-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    };
    return `${base} ${sizes[this.size()]} ${variants[this.variant()]}`;
  }
}
