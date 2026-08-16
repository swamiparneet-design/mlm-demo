import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChildren } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';

type Step = 'details' | 'zone' | 'otp' | 'done';

interface ZoneOption {
  id: 'general' | 'vip';
  name: string;
  entryAmount: number;
  description: string;
  available: boolean;
}

const ZONE_OPTIONS: ZoneOption[] = [
  {
    id: 'general',
    name: 'General Zone',
    entryAmount: 5599,
    description: 'The standard entry point for every new member. Start earning as your team grows.',
    available: true,
  },
  {
    id: 'vip',
    name: 'VIP Zone',
    entryAmount: 50000,
    description: 'Higher entry investment with proportionally larger stage payouts.',
    available: false,
  },
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<Step>('details');
  readonly stepIndex = computed(() => ({ details: 0, zone: 1, otp: 2, done: 3 })[this.step()]);
  readonly loading = signal(false);
  readonly zones = ZONE_OPTIONS;
  readonly selectedZone = signal<ZoneOption>(ZONE_OPTIONS[0]);

  readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);
  readonly otpError = signal('');
  readonly otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    referrerEmail: [''],
  });

  fieldError(name: 'fullName' | 'email' | 'mobile' | 'password'): string {
    const ctrl = this.form.controls[name];
    if (!ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['minlength'] && name === 'fullName') return 'Enter your full name.';
    if (ctrl.errors['minlength'] && name === 'password') return 'Password must be at least 6 characters.';
    if (ctrl.errors['pattern'] && name === 'mobile') return 'Enter a valid mobile number (digits only).';
    return '';
  }

  goToZoneStep(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set('zone');
  }

  selectZone(zone: ZoneOption): void {
    if (!zone.available) return;
    this.selectedZone.set(zone);
  }

  submitRegistration(): void {
    this.loading.set(true);
    const raw = this.form.getRawValue();

    this.auth
      .register({
        fullName: raw.fullName,
        email: raw.email,
        mobile: raw.mobile,
        password: raw.password,
        referrerEmail: raw.referrerEmail?.trim() || null,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.step.set('otp');
        },
        error: () => this.loading.set(false),
      });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);
    const digits = [...this.otpDigits()];
    digits[index] = value;
    this.otpDigits.set(digits);
    this.otpError.set('');

    if (value && index < 5) {
      this.otpInputs()[index + 1]?.nativeElement.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      this.otpInputs()[index - 1]?.nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text')?.replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const digits = pasted.split('');
    while (digits.length < 6) digits.push('');
    this.otpDigits.set(digits);
    const lastIndex = Math.min(pasted.length, 6) - 1;
    if (lastIndex >= 0) {
      this.otpInputs()[lastIndex]?.nativeElement.focus();
    }
  }

  verifyOtp(): void {
    const otp = this.otpDigits().join('');
    if (otp.length !== 6) {
      this.otpError.set('Enter the full 6-digit code.');
      return;
    }

    this.loading.set(true);
    this.auth.verifyOtp({ mobile: this.form.getRawValue().mobile, otp }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.verified) {
          this.step.set('done');
        } else {
          this.otpError.set(response.message || 'Invalid OTP. Please try again.');
        }
      },
      error: () => this.loading.set(false),
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
