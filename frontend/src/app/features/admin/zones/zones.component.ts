import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
import { PlacementStrategyType, Zone } from '../../../core/models/zone.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

const STRATEGY_OPTIONS: PlacementStrategyType[] = ['Sequential', 'CapacityBased', 'BatchFill'];

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    InputComponent,
    ModalComponent,
    SkeletonComponent,
    TableComponent,
  ],
  templateUrl: './zones.component.html',
})
export class ZonesComponent {
  private readonly zoneService = inject(ZoneService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly zones = signal<Zone[]>([]);
  readonly modalOpen = signal(false);
  readonly editingZone = signal<Zone | null>(null);
  readonly deleteTarget = signal<Zone | null>(null);
  readonly strategyOptions = STRATEGY_OPTIONS;

  readonly form = this.fb.nonNullable.group({
    zoneName: ['', Validators.required],
    sequenceOrder: [1, [Validators.required, Validators.min(1)]],
    entryAmount: [0, [Validators.required, Validators.min(0)]],
    requiresNewInvestmentIfDirectEntry: [false],
    placementStrategyType: ['Sequential' as PlacementStrategyType, Validators.required],
    capacityLimit: [null as number | null],
    isActive: [true],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones.set(zones.sort((a, b) => a.sequenceOrder - b.sequenceOrder));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingZone.set(null);
    this.form.reset({
      zoneName: '',
      sequenceOrder: this.zones().length + 1,
      entryAmount: 0,
      requiresNewInvestmentIfDirectEntry: false,
      placementStrategyType: 'Sequential',
      capacityLimit: null,
      isActive: true,
    });
    this.modalOpen.set(true);
  }

  openEdit(zone: Zone): void {
    this.editingZone.set(zone);
    this.form.reset({ ...zone });
    this.modalOpen.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    const editing = this.editingZone();
    const request = editing ? this.zoneService.update(editing.id, payload) : this.zoneService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Zone updated' : 'Zone created');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(zone: Zone): void {
    this.deleteTarget.set(zone);
  }

  deleteConfirmed(): void {
    const zone = this.deleteTarget();
    if (!zone) return;
    this.zoneService.delete(zone.id).subscribe({
      next: () => {
        this.toast.success('Zone deleted');
        this.deleteTarget.set(null);
        this.load();
      },
    });
  }
}
