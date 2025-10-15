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
        onHover: (event, activeElements) => {
          if (this.isUpdating) return; // Предотвращаем рекурсию

          if (activeElements.length > 0) {
            // Наводим на график - показываем сумму
            if (!this.originalData) {
              this.originalData = [...this.chart.data.datasets[0].data];
            }

            const sum = this.originalData[0] + this.originalData[1];

            this.isUpdating = true;
            this.chart.data.datasets[0].data = [sum];
            this.chart.update('none');
            this.isUpdating = false;

            this.isHovered = true;
          } else if (this.isHovered) {
            // Убираем курсор - возвращаем исходные данные
            if (this.originalData && this.originalData.length === 2) {
              this.isUpdating = true;
              this.chart.data.datasets[0].data = [...this.originalData];
              this.chart.update('none');
              this.isUpdating = false;
            }
            this.isHovered = false;
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
            position: 'average',
            mode: 'nearest',
            intersect: true,
            external: context => {
              const { chart, tooltip } = context
              const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');

              if (!tooltipEl) return

              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              // Вычисляем сумму для отображения в tooltip
              const sum = this.originalData ? (this.originalData[0] + this.originalData[1]) : 0;

              // Очищаем tooltip
              tooltipEl.innerHTML = ''

              // Создаем элемент с суммой
              const el = document.createElement('div');
              el.innerHTML = `<span class="value">${formattingPrice(sum)}</span>`;
              tooltipEl.appendChild(el);

              tooltipEl.style.opacity = 1;

              // Позиционируем tooltip всегда справа внизу
              this.onPosExternal(tooltipEl, chart, tooltip, 0);
            }
          }
        }
      }
    }

    super(ctx, merge({}, defaultOptions, addOptions))

    this.wpChart = this.chart.canvas.closest('.wp-chart')
    this.labelLeft = this.wpChart.querySelector('.chart-label-left');
    this.labelRight = this.wpChart.querySelector('.chart-label-right');
    this.originalData = null; // Для хранения исходных данных
    this.isHovered = false; // Флаг состояния hover
    this.isUpdating = false; // Флаг для предотвращения рекурсии
  }

  onPosExternal(tooltipEl, chart, tooltip, dataI) {
    // Всегда позиционируем tooltip справа внизу графика
    tooltipEl.style.left = (chart.canvas.offsetLeft + chart.canvas.clientWidth) - tooltipEl.clientWidth + 'px';
    tooltipEl.style.top = (chart.canvas.offsetTop + chart.canvas.clientHeight) + 6 + 'px';
  }

  render([{ revenue, reestr_sum }, { finance_planfact }]) {
    this.chart.data.datasets[0].data = [
      revenue,
      reestr_sum - (finance_planfact.at(-1).revenue_reestr_accumulated || 0)
    ]

    // Сбрасываем сохраненные данные при новом рендере
    this.originalData = null;
    this.isHovered = false;

    this.chart.update();

    // Обновляем лейблы
    this.labelLeft.textContent = formattingPrice(this.chart.data.datasets[0].data[1]);
    this.labelRight.textContent = formattingPrice(this.chart.data.datasets[0].data[0]);
  }
}

export default PaymentStructure;
