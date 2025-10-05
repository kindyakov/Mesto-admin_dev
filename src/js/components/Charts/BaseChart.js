import Chart from 'chart.js/auto'
import merge from 'lodash.merge'
import { createElement } from '../../settings/createElement.js';

class BaseChart {
  constructor(ctx, options = {}) {
    const ticks = {
      minRotation: 0,
      maxRotation: 0,
      color: '#64748b',
      font: {
        size: 14,
        weight: 500,
        family: 'Manrope'
      },
    };

    const defaultOptions = {
      options: {
        scales: {
          x: {
            ticks,
            border: {
              width: 0
            },
            grid: {
              color: '#f3f3f3',
              lineWidth: 1,
            },
          },
          y: {
            ticks,
            grid: {
              color: '#f3f3f3',
              lineWidth: 1
            },
            border: {
              width: 0
            },
          },
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            position: 'average',
            external: context => {
              const { chart, tooltip } = context
              const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');

              if (!tooltipEl) return
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              tooltipEl.innerHTML = ''

              const dataI = tooltip.dataPoints[0].dataIndex

              chart.data.datasets.length && chart.data.datasets.forEach(obj => {
                const color = Array.isArray(obj.color) ? obj.color[dataI] : obj.color

                const el = createElement('div', {
                  content: `${color ? `<b style="background: ${color};"></b>` : ''}<span class="value">${obj.data[dataI]}</span>`
                })

                tooltipEl.appendChild(el)
              });

              tooltipEl.style.opacity = 1;

              this.onPosExternal(tooltipEl, chart, tooltip, dataI)
              this.onExternal(tooltipEl, chart, tooltip, dataI)
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      plugins: [{
        id: 'verticalLine', // Уникальный идентификатор плагина
        afterDraw: (chart) => {
          if (chart.config.type == 'line' && chart.tooltip._active && chart.tooltip._active.length) {
            const ctx = chart.ctx;
            ctx.save();

            // Получаем первую активную точку для построения линии
            const activePoint = chart.tooltip._active[0];
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            // Рисуем вертикальную линию
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Полупрозрачный черный
            ctx.stroke();

            ctx.restore();
          }
        }
      }],
    };

    this.chart = new Chart(ctx, merge({}, defaultOptions, options));
    this.onExternal = this.onExternal.bind(this)
    this.wpChart = this.chart.canvas.closest('.chart')
    this.app = window.app

    window.addEventListener('resize', () => this.resizeChart())
  }

  resizeChart() {
    if (this.chart) {
      this.chart.update('resize')
    }
  }

  onPosExternal(tooltipEl, chart, tooltip, dataI) {
    // Вычисляем позицию слева
    const leftPosition = (chart.canvas.offsetLeft + tooltip.caretX) - tooltipEl.clientWidth - 6;

    // Проверяем, выходит ли tooltip за левую границу
    if (leftPosition < 0) {
      // Показываем справа
      tooltipEl.style.left = (chart.canvas.offsetLeft + tooltip.caretX) + 6 + 'px';
    } else {
      // Показываем слева
      tooltipEl.style.left = leftPosition + 'px';
    }

    tooltipEl.style.top = (chart.canvas.offsetTop + tooltip.caretY) - tooltipEl.clientHeight - 6 + 'px';
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {

  }

  createLinearGradient(colorOne, colorTwo) {
    const gradient = this.ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorOne);
    gradient.addColorStop(1, colorTwo);

    return gradient
  }
}

export default BaseChart;
