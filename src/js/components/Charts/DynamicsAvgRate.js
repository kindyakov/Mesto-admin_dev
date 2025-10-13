import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
// import { formattingPrice } from '../../utils/formattingPrice.js';
import { getPreviousMonthsRanges } from '../../utils/getPreviousMonthsRanges.js';
import { getDashboardFinance } from '../../settings/request.js';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";

class DynamicsAvgRate extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'bar',
      data: {
        // labels: ['10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
        datasets: [{
          // data: [3500, 3600, 3650, 3725, 3700, 3730, 3750, 3750, 3790, 3800, 3800, 3850],
          backgroundColor: '#5782a1',
          borderRadius: 4,
          barThickness: 20,
        }]
      },
      options: {
        layout: {
          padding: {
            top: 25
          }
        },
        scales: {
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              }
            },
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              }
            }
          }
        },
      },
      plugins: [{
        id: 'barLabels',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              const data = dataset.data[index];
              ctx.fillStyle = '#333';
              ctx.font = '400 10px Manrope';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(data, bar.x, bar.y - 5);
            });
          });
        }
      }]
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    this.wpChart = this.chart.canvas.closest('.wp-chart')

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-dynamics-avg-rate',
    });
  }

  render() {
    if (!this.previousMonthsData) return
    const data = this.previousMonthsData.data.slice(-9)
    const rangeDates = this.previousMonthsData.previousRanges.slice(-9)

    this.chart.data.labels = rangeDates.map(range => {
      const date = new Date(range.start_date);
      return dateFormatter(date, 'LLLL');
    });
    this.chart.data.datasets[0].data = data.map(obj => obj.current_avg_price_per_room || 0)

    this.chart.update();
  }
}

export default DynamicsAvgRate