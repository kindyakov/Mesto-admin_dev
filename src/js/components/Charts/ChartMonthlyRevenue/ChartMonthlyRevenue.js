import merge from 'lodash.merge'
import BaseChart from "../BaseChart.js"
import { Select } from '../../../modules/mySelect.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

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
        labels: [], // Все дни месяца
        datasets: [{
          label: 'Факт',
          data: [], // Замените на ваши фактические данные
          backgroundColor: '#3c50e0',
          color: '#3c50e0',
          barThickness: 6
        }, {
          label: 'План',
          data: [], // Замените на ваши данные плана
          backgroundColor: '#6f7d90',
          color: '#6f7d90',
          barThickness: 6
        }]
      },
      options: {
        scales: {
          x: {
            ticks: {
              minRotation: 60,
              // maxRotation: 0,
              font: {
                size: 12,
              },
              callback: function (value, index, values) {
                const [y, m, d] = this.chart.data.labels[index].split('-')

                return `${d}-${m}`; // Число и месяц в две строки
              }
            }
          },
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

  onExternal(tooltipEl, chart, tooltip) {
    const dataI = tooltip.dataPoints[0].dataIndex
    const date = chart.data.labels[dataI]
    tooltipEl.insertAdjacentHTML('afterbegin', `<div><svg class="icon icon-calendar" style="width: 12px; height: 12px; fill: gray; margin-right: 2px;"><use xlink:href="img/svg/sprite.svg#calendar"></use></svg><span style="font-size: 12px; text-align: center;">${dateFormatter(date)}</span></div>`)
  }

  render(data) {
    this.chart.data.labels = data.length ? data.map(obj => obj.data) : [] // Array.from({ length: data.length }, (_, i) => i + 1)
    this.chart.data.datasets[0].data = data.length ? data.map(obj => obj.revenue) : []
    this.chart.data.datasets[1].data = data.length ? data.map(obj => obj.revenue_planned) : []
    this.chart.update()
  }
}

export default ChartMonthlyRevenue