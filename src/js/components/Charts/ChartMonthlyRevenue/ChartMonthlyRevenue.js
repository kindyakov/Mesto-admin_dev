import merge from 'lodash.merge'
import BaseChart from "../BaseChart.js"
import { Select } from '../../../modules/mySelect.js';

// Функция для генерации случайных данных
function generateRandomData(length, min, max) {
  const data = [];
  for (let i = 0; i < length; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}

class ChartMonthlyRevenue extends BaseChart {
  constructor(ctx, addOptions) {
    const defaultOptions = {
      type: 'bar',
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], // Все дни месяца
        datasets: [{
          label: 'Факт',
          data: generateRandomData(30, 100, 1500), // Замените на ваши фактические данные
          backgroundColor: '#3c50e0',
          color: '#3c50e0',
          barThickness: 6
        }, {
          label: 'План',
          data: generateRandomData(30, 200, 1200), // Замените на ваши данные плана
          backgroundColor: '#6f7d90',
          color: '#6f7d90',
          barThickness: 6
        }]
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, values) {
                const units = ['', 'тыс', 'млн', 'млрд']
                let unitIndex = 0

                while (value >= 1000 && unitIndex < units.length - 1) {
                  value /= 1000
                  unitIndex++
                }

                return value.toFixed(0) + ' ' + units[unitIndex]
              }
            }
          },
        },
        plugins: {
          legend: {
            position: 'top'
          }
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

    this.selects = new Select({ uniqueName: 'select-chart-monthly-revenue', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  render(data) {
    if (!data.length) return
    this.chart.data.labels = Array.from({ length: data.length }, (_, i) => i + 1)
    this.chart.data.datasets[0].data = data.map(obj => obj.revenue)
    this.chart.data.datasets[1].data = data.map(obj => obj.revenue_planned)
    this.chart.update()
  }
}

export default ChartMonthlyRevenue

