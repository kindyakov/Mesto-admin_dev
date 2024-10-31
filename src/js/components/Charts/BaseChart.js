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
                const el = createElement('div', {
                  content: `<b style="background: ${obj.color};"></b><span class="value">${obj.data[dataI]}</span>`
                })

                tooltipEl.appendChild(el)
              });

              tooltipEl.style.opacity = 1;
              tooltipEl.style.left = (chart.canvas.offsetLeft + tooltip.caretX) - tooltipEl.clientWidth - 6 + 'px';
              tooltipEl.style.top = (chart.canvas.offsetTop + tooltip.caretY) - tooltipEl.clientHeight - 6 + 'px';

              this.onExternal(tooltipEl, chart, tooltip)
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    this.chart = new Chart(ctx, merge({}, defaultOptions, options));
    this.onExternal = this.onExternal.bind(this)
    this.wpChart = this.chart.canvas.closest('.chart')

    window.addEventListener('resize', () => this.resizeChart())
  }

  resizeChart() {
    if (this.chart) {
      this.chart.update('resize')
    }
  }

  onExternal(tooltipEl, chart, tooltip) {

  }

  createLinearGradient(colorOne, colorTwo) {
    const gradient = this.ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorOne);
    gradient.addColorStop(1, colorTwo);

    return gradient
  }
}

export default BaseChart;
