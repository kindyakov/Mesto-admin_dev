import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { dateFormatter } from '../../../settings/dateFormatter.js';

class ChartConversions extends BaseChart {
  constructor(ctx, addOptions = {}) {

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Факт',
          data: [],
          borderColor: '#3c50e0',
          color: '#3c50e0',
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          pointRadius: 4,
          fill: true,
          tension: 0.6
        }]
      },
      options: {
        scales: {
          x: {
            ticks: {
              minRotation: 70,
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
          },
        },
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions));
  }

  onExternal(tooltipEl, chart, tooltip) {
    const dataI = tooltip.dataPoints[0].dataIndex
    const date = chart.data.labels[dataI]
    tooltipEl.insertAdjacentHTML('afterbegin', `<div><svg class="icon icon-calendar" style="width: 12px; height: 12px; fill: gray; margin-right: 2px;"><use xlink:href="img/svg/sprite.svg#calendar"></use></svg><span style="font-size: 12px; text-align: center;">${dateFormatter(date)}</span></div>`)
  }

  render({ conversions = [] }) {
    const el = this.chart.canvas.closest('.chart').querySelector('.chart__title span')
    el.textContent = conversions.length
    this.chart.data.labels = conversions.length ? conversions.map(obj => obj.date) : []
    this.chart.data.datasets[0].data = conversions.length ? conversions.map(obj => obj.conversion_rate) : []
    this.chart.update()
  }
}

export default ChartConversions