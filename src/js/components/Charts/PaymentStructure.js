import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { formattingPrice } from '../../utils/formattingPrice.js';

class PaymentStructure extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'doughnut',
      data: {
        labels: ['Аренда', 'Продажи: арендная плата', 'Продажи: депозит'],
        datasets: [{
          data: [900000, 450000, 150000],
          backgroundColor: [
            '#00455F',
            '#5B8FA3',
            '#A8C5D1'
          ],
          color: [
            '#00455F',
            '#5B8FA3',
            '#A8C5D1'
          ],
          borderWidth: 0,
          cutout: '40%',
        }]
      },
      options: {
        scales: {
          y: {
            display: false
          },
          x: {
            display: false
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
      }
    }

    super(ctx, merge({}, defaultOptions, addOptions))
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formattingPrice(parseFloat(el.innerText));
      el.classList.add('text-[#64748b]', 'font-medium', 'text-[10px]');
    });
  }

  render([{ revenue_rent, new_clients_revenue_rent, new_clients_revenue_deposit }, { finance_planfact }]) {
    this.chart.data.datasets[0].data = [revenue_rent, new_clients_revenue_rent, new_clients_revenue_deposit]

    this.chart.update();
  }
}

export default PaymentStructure;