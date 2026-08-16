import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-smooth duration-150 ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus-visible:ring-brand-500',
      secondary: 'bg-navy-900 text-white shadow-soft hover:bg-navy-800 focus-visible:ring-navy-700',
      outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus-visible:ring-slate-400',
      ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
      danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700 focus-visible:ring-red-500',
      gold: 'bg-gold-600 text-white shadow-soft hover:bg-gold-700 focus-visible:ring-gold-500',
    };

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${this.fullWidth() ? 'w-full' : ''}`;
  }
}
