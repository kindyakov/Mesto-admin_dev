import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';

function generateRandomData(length, min, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function createDatasets({ data, label, color, gradient, params = {} }) {
  return {
    label,
    data, // Замените на ваши фактические данные
    borderColor: color,
    color: color,
    pointBackgroundColor: '#fff',
    backgroundColor: gradient,
    pointRadius: 0,
    fill: true,
    tension: 0.6,
    ...params
  }
}

class ChartSalesChannels extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => i + 1), // Все дни месяца
        datasets: [
          createDatasets({
            data: generateRandomData(30, 20, 30), label: 'Яндекс директ', color: '#fac800', gradient: () => {
              const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(250, 200, 0, 0.1)');
              gradient.addColorStop(1, 'rgba(250, 200, 0, 0.01)');
              return gradient
            }
          }),
          createDatasets({
            data: generateRandomData(30, 15, 25), label: 'Вконтакте', color: '#11b880', gradient: () => {
              const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(17, 184, 128, 0.1)');
              gradient.addColorStop(1, 'rgba(17, 184, 128, 0.01)');
              return gradient
            }
          }),
          createDatasets({
            data: generateRandomData(30, 10, 20), label: 'Google Adsense', color: '#ff7628', gradient: () => {
              const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(255, 118, 40, 0.1)');
              gradient.addColorStop(1, 'rgba(255, 118, 40, 0.01)');
              return gradient
            }
          }),
          createDatasets({
            data: generateRandomData(30, 5, 15), label: 'Facebook', color: '#3D50E0', gradient: () => {
              const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
              gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');
              return gradient
            }
          }),
          createDatasets({
            data: generateRandomData(30, 1, 2), label: 'План', color: '#6f7d90', gradient: 'transparent', params: {
              borderWidth: 2,
              borderDash: [5, 5], // Пунктирная линия
              backgroundColor: 'transparent'
            }
          }),
        ]
      },
      options: {
        scales: {
          x: {
            grid: {
              display: false  // Убирает вертикальную сетку
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              borderDash: [5, 5],  // Делает горизонтальную сетку пунктирной
              color: '#e2e8f0'  // Цвет пунктирной сетки (опционально)
            },
          },
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: true
          },
          // Для заштрихованной области можно использовать плагин, например, chartjs-plugin-annotation
        }
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions));

    this.datasets = {
      '': () => {
        this.chart.data.datasets[0].hidden = true;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
      '': () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = true;
        this.chart.update();
      },
      '': () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-sales-channels', selectMinWidth: 155 });
    // this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  render() { }
}

export default ChartSalesChannels