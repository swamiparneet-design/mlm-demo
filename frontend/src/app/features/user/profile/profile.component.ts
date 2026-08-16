import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MeService } from '../../../core/services/me.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppUser } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SkeletonComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly meService = inject(MeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly profile = signal<AppUser | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    mobile: ['', [Validators.required]],
  });

  constructor() {
    this.meService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.patchValue({ fullName: profile.fullName, mobile: profile.mobile });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.meService.updateProfile(this.form.getRawValue()).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.saving.set(false);
        this.toast.success('Profile updated', 'Your changes have been saved.');
      },
      error: () => this.saving.set(false),
    });
  }

  kycVariant(status: string): 'emerald' | 'gold' | 'red' {
    return status === 'Verified' ? 'emerald' : status === 'Pending' ? 'gold' : 'red';
  }
}
