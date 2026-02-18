import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class ChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() type!: ChartType;
  @Input() data!: any;
  @Input() options?: any;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;

  ngOnInit() {
    // Chart initialization will happen in ngAfterViewInit
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart && (changes['data'] || changes['options'])) {
      this.updateChart();
    }
  }

  private createChart() {
    if (!this.chartCanvas || !this.data || !this.type) {
      return;
    }

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        ...this.getDefaultOptions(),
        ...this.options,
        responsive: true,
        maintainAspectRatio: false
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart() {
    if (!this.chart || !this.data) {
      return;
    }

    this.chart.data = this.data;
    if (this.options) {
      this.chart.options = {
        ...this.getDefaultOptions(),
        ...this.options,
        responsive: true,
        maintainAspectRatio: false
      };
    }
    this.chart.update();
  }

  private getDefaultOptions() {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            font: {
              size: 11
            },
            padding: 10
          }
        },
        tooltip: {
          enabled: true
        }
      },
      scales: this.type !== 'pie' && this.type !== 'doughnut' ? {
        x: {
          ticks: {
            font: {
              size: 10
            }
          }
        },
        y: {
          ticks: {
            font: {
              size: 10
            },
            callback: function(value: any) {
              return value.toLocaleString();
            }
          }
        }
      } : undefined
    };
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

