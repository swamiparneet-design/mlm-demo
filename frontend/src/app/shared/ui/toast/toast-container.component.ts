import { Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 w-[calc(100%-2rem)] sm:w-96">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-xl border shadow-soft-lg p-4 bg-white animate-[toastIn_0.2s_ease-out]"
          [class]="borderClass(toast.variant)"
        >
          <div class="shrink-0 mt-0.5" [innerHTML]="icon(toast.variant)"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-sm text-slate-500 mt-0.5">{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 shrink-0"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  borderClass(variant: ToastVariant): string {
    return {
      success: 'border-brand-200',
      error: 'border-red-200',
      warning: 'border-gold-200',
      info: 'border-blue-200',
    }[variant];
  }

  icon(variant: ToastVariant): string {
    const wrap = (color: string, path: string) =>
      `<svg class="w-5 h-5 ${color}" fill="currentColor" viewBox="0 0 20 20">${path}</svg>`;

    switch (variant) {
      case 'success':
        return wrap(
          'text-brand-600',
          '<path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clip-rule="evenodd"/>',
        );
      case 'error':
        return wrap(
          'text-red-600',
          '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 011.4 0l0 0 1.9 1.9 1.9-1.9a1 1 0 111.4 1.4L13.4 10.6l1.9 1.9a1 1 0 01-1.4 1.4l-1.9-1.9-1.9 1.9a1 1 0 01-1.4-1.4l1.9-1.9-1.9-1.9a1 1 0 010-1.4z" clip-rule="evenodd"/>',
        );
      case 'warning':
        return wrap(
          'text-gold-600',
          '<path fill-rule="evenodd" d="M8.3 3.3a2 2 0 013.4 0l6.5 11.3A2 2 0 0116.5 18h-13a2 2 0 01-1.7-3.4L8.3 3.3zM10 7a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>',
        );
      default:
        return wrap(
          'text-blue-600',
          '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 000 2h1v3a1 1 0 102 0v-4a1 1 0 00-1-1H9zm1-3a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>',
        );
    }
  }
}
