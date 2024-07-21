import BaseChart from "../BaseChart.js";
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';

function generateRandomData(length, min, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

class ChartAreaRentedCells extends BaseChart {
  constructor(ctx, addOptions) {

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'], // Все дни месяца
        datasets: [{
          label: 'Факт',
          data: generateRandomData(12, 0, 50), // Замените на ваши фактические данные
          borderColor: '#3c50e0',
          color: '#3c50e0',
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          pointRadius: 0,
          fill: true,
          tension: 0.6
        }, {
          label: 'План',
          data: generateRandomData(12, 0, 50), // Замените на ваши данные плана
          borderColor: '#6f7d90',
          color: '#6f7d90',
          pointRadius: 0,
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          borderWidth: 2,
          borderDash: [5, 5], // Пунктирная линия
          fill: false,
          tension: 0.6
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
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
      plan: () => {
        this.chart.data.datasets[0].hidden = true;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
      fact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = true;
        this.chart.update();
      },
      planFact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-area-rented-cells', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  render() { }
}

export default ChartAreaRentedCells