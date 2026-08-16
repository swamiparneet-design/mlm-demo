import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `
    <div class="w-full relative" [style.height.px]="height()">
      <canvas #canvasRef></canvas>
    </div>
  `,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasRef');

  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartConfiguration['data']>();
  readonly options = input<ChartConfiguration['options']>({});
  readonly height = input(280);

  private chart?: Chart;

  private currentType?: ChartType;

  constructor() {
    effect(() => {
      const data = this.data();
      const options = this.options();
      const type = this.type();

      if (!this.chart) {
        return;
      }

      if (this.currentType !== type) {
        this.chart.destroy();
        this.createChart(type, data, options);
        return;
      }

      this.chart.data = data;
      this.chart.options = options ?? {};
      this.chart.update();
    });
  }

  ngAfterViewInit(): void {
    this.createChart(this.type(), this.data(), this.options());
  }

  private createChart(type: ChartType, data: ChartConfiguration['data'], options: ChartConfiguration['options']): void {
    this.currentType = type;
    this.chart = new Chart(this.canvasRef().nativeElement, {
      type,
      data,
      options: options ?? {},
    } as ChartConfiguration);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
