import BaseChart from "./BaseChart.js"
import merge from 'lodash.merge';
import { formattingPrice } from '../../utils/formattingPrice.js';
import { dateFormatter } from '../../settings/dateFormatter.js';
import { Loader } from "../../modules/myLoader.js";

class RentDynamics extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Арендная плата',
          data: [],
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

    this.wpChart = this.chart.canvas.closest('.wp-chart')

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-dynamics-avg-rate',
    });
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      const data = this.chart.data.dates[dataI]
      el.innerText = `${dateFormatter(data)}: ${formattingPrice(parseFloat(el.innerText))}`;
      el.classList.add('text-[#64748b]', 'font-medium', 'text-[10px]');
    });
  }

  render([currentData, { finance_planfact }]) {
    if (!this.previousMonthsData) return
    const data = [...this.previousMonthsData.data.slice(-3), currentData]
    const rangeDates = [...this.previousMonthsData.previousRanges.slice(-3), this.previousMonthsData.currentRange]

    this.chart.data.datasets[0].data = data.map(obj => obj.total_reestr)
    this.chart.data.labels = rangeDates.map(range => {
      const date = new Date(range.start_date);
      return dateFormatter(date, 'LLLL');
    });
    this.chart.data.dates = rangeDates.map(obj => obj.start_date)

    this.chart.update();
  }
}

export default RentDynamics