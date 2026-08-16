import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <div>
      @if (label()) {
        <label [for]="id" class="block text-sm font-medium text-slate-700 mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <div class="relative">
        @if (prefixIcon()) {
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <ng-content select="[icon]"></ng-content>
          </span>
        }
        <input
          [id]="id"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value"
          [disabled]="disabled"
          [class]="inputClasses()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [autocomplete]="autocomplete()"
          [attr.maxlength]="maxlength()"
        />
      </div>
      @if (hint() && !error()) {
        <p class="mt-1.5 text-xs text-slate-500">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          {{ error() }}
        </p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  readonly id = `app-input-${uid++}`;

  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false);
  readonly prefixIcon = input(false);
  readonly autocomplete = input<string>('off');
  readonly maxlength = input<number | null>(null);

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  inputClasses(): string {
    const base =
      'block w-full rounded-lg border bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-smooth disabled:bg-slate-50 disabled:text-slate-500';
    const padding = this.prefixIcon() ? 'pl-10 pr-3' : 'px-3.5';
    const state = this.error()
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100';
    return `${base} ${padding} ${state}`;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
