import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';

function generateRandomData(length, min, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function createDatasets({ data, label, color, gradient, params = {} }) {
  return {
    label,
    data,
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
        labels: [], // Все дни месяца
        datasets: [
          // createDatasets({
          //   data: generateRandomData(30, 20, 30), label: 'Яндекс директ', color: '#fac800', gradient: () => {
          //     const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          //     gradient.addColorStop(0, 'rgba(250, 200, 0, 0.1)');
          //     gradient.addColorStop(1, 'rgba(250, 200, 0, 0.01)');
          //     return gradient
          //   }
          // }),
          // createDatasets({
          //   data: generateRandomData(30, 15, 25), label: 'Вконтакте', color: '#11b880', gradient: () => {
          //     const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          //     gradient.addColorStop(0, 'rgba(17, 184, 128, 0.1)');
          //     gradient.addColorStop(1, 'rgba(17, 184, 128, 0.01)');
          //     return gradient
          //   }
          // }),
          // createDatasets({
          //   data: generateRandomData(30, 10, 20), label: 'Google Adsense', color: '#ff7628', gradient: () => {
          //     const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          //     gradient.addColorStop(0, 'rgba(255, 118, 40, 0.1)');
          //     gradient.addColorStop(1, 'rgba(255, 118, 40, 0.01)');
          //     return gradient
          //   }
          // }),
          // createDatasets({
          //   data: generateRandomData(30, 5, 15), label: 'Facebook', color: '#3D50E0', gradient: () => {
          //     const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          //     gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
          //     gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');
          //     return gradient
          //   }
          // }),
          // createDatasets({
          //   data: generateRandomData(30, 1, 2), label: 'План', color: '#6f7d90', gradient: 'transparent', params: {
          //     borderWidth: 2,
          //     borderDash: [5, 5], // Пунктирная линия
          //     backgroundColor: 'transparent'
          //   }
          // }),
        ]
      },
      options: {
        scales: {
          x: {
            grid: {
              display: false  // Убирает вертикальную сетку
            },
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
    this.colors = [
      {
        color: '#fac800',
        gradient: () => {
          const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(250, 200, 0, 0.1)');
          gradient.addColorStop(1, 'rgba(250, 200, 0, 0.01)');
          return gradient
        }
      },
      {
        color: '#11b880',
        gradient: () => {
          const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(17, 184, 128, 0.1)');
          gradient.addColorStop(1, 'rgba(17, 184, 128, 0.01)');
          return gradient
        }
      },
      {
        color: '#ff7628',
        gradient: () => {
          const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(255, 118, 40, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 118, 40, 0.01)');
          return gradient
        }
      },
      {
        color: '#3D50E0',
        gradient: () => {
          const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
          gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');
          return gradient
        }
      },
      {
        color: '#6f7d90', gradient: 'transparent',
        params: {
          borderWidth: 2,
          borderDash: [5, 5], // Пунктирная линия
          backgroundColor: 'transparent'
        }
      }
    ]

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

  groupByChannelId(arr) {
    const grouped = {};

    arr.forEach(item => {
      // Проверяем, есть ли массив для данного channel_id, если нет - создаем его
      if (!grouped[item.channel_id]) {
        grouped[item.channel_id] = [];
      }
      // Добавляем объект в соответствующий массив
      grouped[item.channel_id].push(item);
    });

    return Object.values(grouped);
  }

  render([{ leads_stats = [] }, { sales_planfact = [] }]) {
    if (!leads_stats.length) return

    const salesPlanFact = sales_planfact.map(obj => ({
      cnt_leads: obj.leads_planned,
      sale_channel: 'План',
      ...obj
    }))

    const sortData = [...this.groupByChannelId(leads_stats), salesPlanFact]
    const leadsList = this.wpChart.querySelector('.chart__header-flex')
    leadsList.innerHTML = ''

    this.chart.data.labels = sortData[0].map(obj => obj.date)
    sortData.forEach((arr, i) => {
      if (arr.length) {
        this.chart.data.datasets.push(
          createDatasets({
            data: arr.map(obj => obj.cnt_leads),
            label: arr[0].sale_channel,
            params: { ...this.colors[i] }
          })
        )
      }

      if (leadsList) {
        const { color } = this.colors[i] || { color: '#6f7d90' }

        leadsList.insertAdjacentHTML('beforeend', `
            <div class="chart__item-info">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="5" fill="${color}"></circle>
              <circle opacity="0.3" cx="8" cy="8" r="7.5" stroke="${color}"></circle>
            </svg>
            <span style="color: ${color};">${arr[0].sale_channel}</span>
          </div>`)
      }
    })

    this.chart.update()
  }
}

export default ChartSalesChannels