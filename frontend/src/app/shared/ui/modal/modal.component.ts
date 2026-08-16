import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          class="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          (click)="onBackdropClick()"
        ></div>

        <div
          [class]="panelClasses()"
          class="relative w-full bg-white rounded-2xl shadow-soft-lg max-h-[90vh] overflow-y-auto animate-[modalIn_0.18s_ease-out]"
        >
          <div class="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="text-sm text-slate-500 mt-0.5">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-smooth"
              (click)="close.emit()"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-5 sm:px-6 py-5">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly closeOnBackdrop = input(true);

  readonly close = output<void>();

  panelClasses(): string {
    return { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[this.size()];
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close.emit();
    }
  }
}
