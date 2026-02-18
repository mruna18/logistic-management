import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-header py-2 px-3 bg-transparent border-0">
        <h6 class="mb-0 fw-semibold small">{{ title }}</h6>
      </div>
      <div class="card-body pt-0 pb-3 px-3">
        <div class="chart-container" [style.height.px]="height">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; }
  `],
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges {
  @Input() title = '';
  @Input() type: ChartType = 'bar';
  @Input() data: ChartConfiguration['data'] | null = null;
  @Input() options: ChartConfiguration['options'] = {};
  @Input() height = 200;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['options'])) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement || !this.data) return;
    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: this.type === 'pie' || this.type === 'doughnut', position: 'bottom' } },
        ...this.options,
      },
    };
    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart || !this.data) return;
    this.chart.data = this.data;
    this.chart.update();
  }
}
