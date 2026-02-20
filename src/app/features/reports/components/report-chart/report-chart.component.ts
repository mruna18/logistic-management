import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-report-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-chart">
      <div class="chart-container" [style.height.px]="height">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [`
    .report-chart { width: 100%; }
    .chart-container { position: relative; width: 100%; }
  `],
})
export class ReportChartComponent implements AfterViewInit, OnChanges {
  @Input() title = '';
  @Input() type: ChartType = 'bar';
  @Input() data: ChartConfiguration['data'] | null = null;
  @Input() height = 220;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['type'])) {
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
        plugins: {
          legend: { display: this.type === 'pie' || this.type === 'doughnut', position: 'bottom' },
        },
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
