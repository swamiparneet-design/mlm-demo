import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div [class]="'relative overflow-hidden bg-slate-200/70 ' + rounded() + ' ' + customClass()">
      <div
        class="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
      ></div>
    </div>
  `,
})
export class SkeletonComponent {
  readonly customClass = input<string>('h-4 w-full');
  readonly rounded = input<string>('rounded-md');
}
