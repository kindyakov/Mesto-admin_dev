import BaseChart from "./BaseChart.js"
import merge from 'lodash.merge';
import { formattingPrice } from '../../utils/formattingPrice.js';
import { dateFormatter } from '../../settings/dateFormatter.js';


class RentDynamics extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'line',
      data: {
        labels: ['Май', 'Июн', 'Июль', 'Авг', 'Сен'],
        datasets: [{
          label: 'Арендная плата',
          data: [1050000, 1090000, 1120000, 1150000, 1180000],
          borderColor: '#00455F',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          color: '#00455F',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00455F',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        scales: {
          y: {
            ticks: {
              display: false
            }
          },
          x: {
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        hover: {
          mode: 'index',
          intersect: false
        }
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions))
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      const data = this.chart.data.dates[dataI]
      el.innerText = `${dateFormatter(data)}: ${formattingPrice(parseFloat(el.innerText))}`;
      el.classList.add('text-[#64748b]', 'font-medium', 'text-[10px]');
    });
  }

  render([_, { finance_planfact }]) {
    this.chart.data.dates = finance_planfact.map(obj => obj.data)
    this.chart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd'))
    this.chart.data.datasets[0].data = finance_planfact.map(obj => obj.revenue)

    this.chart.update();
  }
}

export default RentDynamics