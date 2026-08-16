import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { AdminService } from '../../../core/services/admin.service';
import { ZoneService } from '../../../core/services/zone.service';
import { StageService } from '../../../core/services/stage.service';
import { DashboardSummary } from '../../../core/models/dashboard.model';
import { PayoutTransaction } from '../../../core/models/payout.model';
import { AdminUserSummary } from '../../../core/models/user.model';
import { Zone } from '../../../core/models/zone.model';
import { Stage } from '../../../core/models/stage.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/charts/chart.component';

type RangeOption = '7d' | '30d' | '90d' | 'all';

const EMERALD = '#059669';
const GOLD = '#D97706';
const NAVY = '#0F172A';
const SLATE = '#64748b';
const PALETTE = [EMERALD, GOLD, NAVY, SLATE, '#0EA5E9', '#8B5CF6'];

interface ZoneBreakdown {
  zoneName: string;
  count: number;
  percent: number;
  collection: number;
}

interface StageFunnelRow {
  stageName: string;
  count: number;
  sequenceOrder: number;
}

interface TopPerformer {
  rank: number;
  fullName: string;
  zoneName: string;
  stageName: string;
  teamSize: number;
  totalEarned: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ButtonComponent,
    StatCardComponent,
    ChartComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private readonly adminService = inject(AdminService);
  private readonly zoneService = inject(ZoneService);
  private readonly stageService = inject(StageService);

  readonly loading = signal(true);
  readonly range = signal<RangeOption>('30d');
  readonly rangeOptions: { id: RangeOption; label: string }[] = [
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: '90d', label: '90d' },
    { id: 'all', label: 'All time' },
  ];

  readonly summary = signal<DashboardSummary | null>(null);
  readonly allUsers = signal<AdminUserSummary[]>([]);
  readonly allPayouts = signal<PayoutTransaction[]>([]);
  readonly zones = signal<Zone[]>([]);
  readonly stages = signal<Stage[]>([]);

  readonly rangeStart = computed<Date | null>(() => {
    const r = this.range();
    if (r === 'all') return null;
    const days = r === '7d' ? 7 : r === '30d' ? 30 : 90;
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  readonly members = computed(() => this.allUsers().filter((u) => u.role === 'User'));

  readonly usersInRange = computed(() => {
    const start = this.rangeStart();
    return this.members().filter((u) => !start || new Date(u.createdAt) >= start);
  });

  readonly payoutsInRange = computed(() => {
    const start = this.rangeStart();
    return this.allPayouts().filter((p) => !start || new Date(p.createdAt) >= start);
  });

  readonly hasEnoughUserData = computed(() => this.usersInRange().length >= 3);
  readonly hasEnoughPayoutData = computed(() => this.payoutsInRange().length >= 3);

  // ---- Trend indicators (period vs equal-length prior period) ----
  readonly usersTrend = computed(() => this.computeTrend(this.members().map((u) => new Date(u.createdAt))));
  readonly collectionsTrend = computed(() =>
    this.computeTrend(
      this.members()
        .filter((u) => u.currentZoneName)
        .map((u) => new Date(u.createdAt)),
    ),
  );
  readonly payoutsTrend = computed(() =>
    this.computeTrend(this.allPayouts().filter((p) => p.status === 'Completed').map((p) => new Date(p.createdAt))),
  );
  readonly retainedTrend = computed(() =>
    this.computeTrend(this.allPayouts().filter((p) => p.status === 'Completed').map((p) => new Date(p.createdAt))),
  );

  private computeTrend(dates: Date[]): string {
    const start = this.rangeStart();
    if (!start || dates.length === 0) return '-';
    const rangeLengthMs = Date.now() - start.getTime();
    const prevStart = new Date(start.getTime() - rangeLengthMs);
    const currentCount = dates.filter((d) => d >= start).length;
    const prevCount = dates.filter((d) => d >= prevStart && d < start).length;
    if (prevCount === 0) return currentCount > 0 ? '+new' : '-';
    const change = ((currentCount - prevCount) / prevCount) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(0)}% vs prior period`;
  }

  // ---- Zone-wise distribution ----
  readonly zoneBreakdown = computed<ZoneBreakdown[]>(() => {
    const users = this.usersInRange();
    const total = users.length;
    const zoneEntryByName = new Map(this.zones().map((z) => [z.zoneName, z.entryAmount]));
    const counts = new Map<string, number>();
    for (const u of users) {
      const zone = u.currentZoneName ?? 'Unassigned';
      counts.set(zone, (counts.get(zone) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([zoneName, count]) => ({
        zoneName,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
        collection: count * (zoneEntryByName.get(zoneName) ?? 0),
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly zoneDonutData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.zoneBreakdown().map((z) => z.zoneName),
    datasets: [
      {
        data: this.zoneBreakdown().map((z) => z.count),
        backgroundColor: PALETTE,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }));

  readonly zoneDonutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } },
  };

  // ---- Stage-wise funnel ----
  readonly stageFunnel = computed<StageFunnelRow[]>(() => {
    const users = this.usersInRange();
    const seqByStage = new Map<string, number>();
    for (const stage of this.stages()) {
      const existing = seqByStage.get(stage.stageName);
      if (existing === undefined || stage.sequenceOrder < existing) {
        seqByStage.set(stage.stageName, stage.sequenceOrder);
      }
    }
    const counts = new Map<string, number>();
    for (const u of users) {
      if (!u.currentStageName) continue;
      counts.set(u.currentStageName, (counts.get(u.currentStageName) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([stageName, count]) => ({ stageName, count, sequenceOrder: seqByStage.get(stageName) ?? 99 }))
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  });

  readonly funnelMax = computed(() => Math.max(1, ...this.stageFunnel().map((s) => s.count)));

  // ---- User growth chart ----
  readonly userGrowthData = computed<ChartConfiguration<'line'>['data']>(() => {
    const buckets = this.buildTimeBuckets(this.usersInRange().map((u) => new Date(u.createdAt)));
    let cumulative = 0;
    const cumulativeData = buckets.counts.map((c) => (cumulative += c));
    return {
      labels: buckets.labels,
      datasets: [
        {
          label: 'Total users',
          data: cumulativeData,
          borderColor: EMERALD,
          backgroundColor: 'rgba(5, 150, 105, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2.5,
        },
      ],
    };
  });

  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  // ---- Payout trend chart (bar + line) ----
  readonly payoutTrendData = computed<ChartConfiguration['data']>(() => {
    const payouts = this.payoutsInRange().filter((p) => p.status === 'Completed');
    const buckets = this.buildTimeBuckets(
      payouts.map((p) => new Date(p.createdAt)),
      payouts.map((p) => p.netPayoutAmount),
    );
    const retainedBuckets = this.buildTimeBuckets(
      payouts.map((p) => new Date(p.createdAt)),
      payouts.map((p) => p.retentionAmount),
    );
    return {
      labels: buckets.labels,
      datasets: [
        {
          type: 'bar',
          label: 'Net payout',
          data: buckets.counts,
          backgroundColor: EMERALD,
          borderRadius: 6,
          maxBarThickness: 40,
          order: 2,
        },
        {
          type: 'line',
          label: 'Retained',
          data: retainedBuckets.counts,
          borderColor: GOLD,
          backgroundColor: GOLD,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2.5,
          order: 1,
          yAxisID: 'y',
        },
      ],
    };
  });

  readonly payoutTrendOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 12 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  // ---- Top performers ----
  readonly topPerformers = computed<TopPerformer[]>(() =>
    [...this.members()]
      .sort((a, b) => b.teamSize - a.teamSize)
      .slice(0, 10)
      .map((u, i) => ({
        rank: i + 1,
        fullName: u.fullName,
        zoneName: u.currentZoneName ?? '—',
        stageName: u.currentStageName ?? '—',
        teamSize: u.teamSize,
        totalEarned: u.totalEarned,
      })),
  );

  readonly totalUsersLabel = computed(() => (this.summary()?.totalUsers ?? 0).toString());
  readonly totalCollectionsLabel = computed(() => `₹${(this.summary()?.totalCollections ?? 0).toLocaleString('en-IN')}`);
  readonly totalPayoutsLabel = computed(() => `₹${(this.summary()?.totalPayouts ?? 0).toLocaleString('en-IN')}`);
  readonly totalRetainedLabel = computed(() => `₹${(this.summary()?.totalRetainedAmount ?? 0).toLocaleString('en-IN')}`);

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    let done = 0;
    const finish = () => {
      done += 1;
      if (done >= 4) this.loading.set(false);
    };

    this.adminService.getDashboardSummary().subscribe({
      next: (s) => {
        this.summary.set(s);
        finish();
      },
      error: finish,
    });
    this.adminService.getAllUsers().subscribe({
      next: (u) => {
        this.allUsers.set(u);
        finish();
      },
      error: finish,
    });
    this.adminService.getAllPayouts().subscribe({
      next: (p) => {
        this.allPayouts.set(p);
        finish();
      },
      error: finish,
    });
    this.zoneService.getAll().subscribe({ next: (z) => this.zones.set(z) });
    this.stageService.getAll().subscribe({
      next: (s) => {
        this.stages.set(s);
        finish();
      },
    });
  }

  setRange(range: RangeOption): void {
    this.range.set(range);
  }

  private buildTimeBuckets(dates: Date[], weights?: number[]): { labels: string[]; counts: number[] } {
    if (dates.length === 0) return { labels: [], counts: [] };

    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const start = this.rangeStart() ?? sorted[0];
    const end = new Date();
    const spanDays = Math.max(1, (end.getTime() - start.getTime()) / 86400000);

    const granularity: 'day' | 'week' | 'month' = spanDays <= 31 ? 'day' : spanDays <= 180 ? 'week' : 'month';

    const keyOf = (d: Date): string => {
      if (granularity === 'day') return d.toISOString().slice(0, 10);
      if (granularity === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().slice(0, 10);
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const labelOf = (key: string): string => {
      if (granularity === 'month') {
        const [y, m] = key.split('-');
        return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const map = new Map<string, number>();
    dates.forEach((d, i) => {
      const key = keyOf(d);
      const weight = weights ? weights[i] : 1;
      map.set(key, (map.get(key) ?? 0) + weight);
    });

    const keys = Array.from(map.keys()).sort();
    return { labels: keys.map(labelOf), counts: keys.map((k) => map.get(k) ?? 0) };
  }

  exportCsv(): void {
    const summary = this.summary();
    const rows: string[] = [];
    rows.push('Ascendia Report Export');
    rows.push(`Generated At,${new Date().toISOString()}`);
    rows.push(`Date Range,${this.range()}`);
    rows.push('');
    rows.push('Summary Metric,Value');
    rows.push(`Total Users,${summary?.totalUsers ?? 0}`);
    rows.push(`Total Collections,${summary?.totalCollections ?? 0}`);
    rows.push(`Total Payouts Disbursed,${summary?.totalPayouts ?? 0}`);
    rows.push(`Net Company Retained,${summary?.totalRetainedAmount ?? 0}`);
    rows.push('');
    rows.push('Rank,Name,Zone,Stage,Team Size,Total Earned');
    for (const p of this.topPerformers()) {
      rows.push(`${p.rank},"${p.fullName}",${p.zoneName},${p.stageName},${p.teamSize},${p.totalEarned}`);
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascendia-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
