import BaseChart from "./BaseChart.js";
import merge from 'lodash.merge';
import { formattingPrice } from '../../utils/formattingPrice.js';

class PaymentStructure extends BaseChart {
  constructor(ctx, addOptions = {}) {
    const defaultOptions = {
      type: 'doughnut',
      data: {
        labels: ['Выручка', 'Осталось собрать'],
        datasets: [{
          data: [],
          backgroundColor: [
            '#5782A1',
            '#E3AA39',
          ],
          color: [
            '#5782A1',
            '#E3AA39',
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
        },
        onHover: (event, activeElements, chart) => {
          this.handleHover(event, chart);
        }
      }
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    const parent = this.chart.canvas.parentElement;
    parent.classList.add('relative');

    // Создаем лейблы один раз
    const labelLeft = document.createElement('div');
    labelLeft.className = 'chart-label-left absolute right-0 top-0 -translate-y-1/2 font-semibold text-sm whitespace-nowrap';
    labelLeft.style.color = '#5782A1';
    // parent.appendChild(labelLeft);

    const labelRight = document.createElement('div');
    labelRight.className = 'chart-label-right absolute left-0 top-0 -translate-y-1/2 font-semibold text-sm whitespace-nowrap';
    labelRight.style.color = '#E3AA39';
    // parent.appendChild(labelRight);

    this.labelLeft = labelLeft;
    this.labelRight = labelRight;

    this.originalData = [];
    this.originalColors = ['#5782A1', '#E3AA39'];
    this.hoverColor = '#005C9E';
    this.isHovered = false;

    this.chart.canvas.addEventListener('mouseleave', () => {
      if (this.isHovered) {
        this.hideHoverState();
      }
    });
  }

  handleHover(event, activeElements, chart) {
    const isOverChart = activeElements.length > 0;

    if (isOverChart && !this.isHovered) {
      this.showHoverState();
    } else if (!isOverChart && this.isHovered) {
      this.hideHoverState();
    }
  }

  showHoverState() {
    this.isHovered = true;
    const dataset = this.chart.data.datasets[0];

    this.originalData = [...dataset.data];
    const sum = dataset.data.reduce((acc, val) => acc + (val || 0), 0);

    dataset.data = [sum];
    dataset.backgroundColor = [this.hoverColor];

    this.chart.update();
  }

  hideHoverState() {
    this.isHovered = false;
    const dataset = this.chart.data.datasets[0];

    dataset.data = [...this.originalData];
    dataset.backgroundColor = [...this.originalColors];

    this.chart.update();
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formattingPrice(parseFloat(el.innerText));
      el.classList.add('text-[#64748b]', 'font-medium', 'text-[10px]');
    });
  }

  render([{ revenue_rent, new_clients_revenue_rent, new_clients_revenue_deposit, reestr_sum }, { finance_planfact }]) {
    this.chart.data.datasets[0].data = [
      revenue_rent - new_clients_revenue_rent + new_clients_revenue_deposit,
      reestr_sum - (finance_planfact.at(-1).revenue_reestr_accumulated || 0)
    ]

    this.chart.update();

    // Обновляем лейблы
    this.labelLeft.textContent = formattingPrice(this.chart.data.datasets[0].data[0]);
    this.labelRight.textContent = formattingPrice(this.chart.data.datasets[0].data[1]);
  }
}

export default PaymentStructure;