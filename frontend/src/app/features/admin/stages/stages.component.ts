import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StageService } from '../../../core/services/stage.service';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
import { Stage } from '../../../core/models/stage.model';
import { Zone } from '../../../core/models/zone.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-stages',
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
  templateUrl: './stages.component.html',
})
export class StagesComponent {
  private readonly stageService = inject(StageService);
  private readonly zoneService = inject(ZoneService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly stages = signal<Stage[]>([]);
  readonly zones = signal<Zone[]>([]);
  readonly zoneFilter = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly editingStage = signal<Stage | null>(null);
  readonly deleteTarget = signal<Stage | null>(null);

  readonly filteredStages = computed(() => {
    const filter = this.zoneFilter();
    const list = this.stages();
    return filter ? list.filter((s) => s.zoneId === filter) : list;
  });

  readonly form = this.fb.nonNullable.group({
    zoneId: [0, [Validators.required, Validators.min(1)]],
    stageName: ['', Validators.required],
    sequenceOrder: [1, [Validators.required, Validators.min(1)]],
    requiredPlacementCount: [0, [Validators.required, Validators.min(0)]],
    requiredReferralCount: [0, [Validators.required, Validators.min(0)]],
    payoutAmount: [0, [Validators.required, Validators.min(0)]],
    retentionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    itemReward: [''],
    isActive: [true],
  });

  constructor() {
    this.zoneService.getAll().subscribe({ next: (zones) => this.zones.set(zones) });
    this.load();
  }

  zoneName(zoneId: number): string {
    return this.zones().find((z) => z.id === zoneId)?.zoneName ?? '—';
  }

  load(): void {
    this.loading.set(true);
    this.stageService.getAll().subscribe({
      next: (stages) => {
        this.stages.set(stages.sort((a, b) => a.zoneId - b.zoneId || a.sequenceOrder - b.sequenceOrder));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingStage.set(null);
    this.form.reset({
      zoneId: this.zoneFilter() ?? this.zones()[0]?.id ?? 0,
      stageName: '',
      sequenceOrder: 1,
      requiredPlacementCount: 0,
      requiredReferralCount: 0,
      payoutAmount: 0,
      retentionPercentage: 0,
      itemReward: '',
      isActive: true,
    });
    this.modalOpen.set(true);
  }

  openEdit(stage: Stage): void {
    this.editingStage.set(stage);
    this.form.reset({ ...stage, itemReward: stage.itemReward ?? '' });
    this.modalOpen.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const editing = this.editingStage();

    const request = editing
      ? this.stageService.update(editing.id, { ...raw, itemReward: raw.itemReward || null })
      : this.stageService.create({ ...raw, itemReward: raw.itemReward || null });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Stage updated' : 'Stage created');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(stage: Stage): void {
    this.deleteTarget.set(stage);
  }

  deleteConfirmed(): void {
    const stage = this.deleteTarget();
    if (!stage) return;
    this.stageService.delete(stage.id).subscribe({
      next: () => {
        this.toast.success('Stage deleted');
        this.deleteTarget.set(null);
        this.load();
      },
    });
  }
}
