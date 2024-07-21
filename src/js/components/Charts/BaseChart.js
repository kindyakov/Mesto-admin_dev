import Chart from 'chart.js/auto'
import merge from 'lodash.merge'

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
            external: function (context) {
              const { chart, tooltip } = context
              const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');

              if (!tooltipEl) return
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              const dataI = tooltip.dataPoints[0].dataIndex
              const data1 = chart.data.datasets[0]
              const data2 = chart.data.datasets[1]

              tooltipEl.innerHTML = `<div><b style="background: ${data1.color};"></b><span>${data1.data[dataI]}</span></div>
              <div><b style="background: ${data2.color};"></b><span>${data2.data[dataI]}</span></div>`
              tooltipEl.style.opacity = 1;
              tooltipEl.style.left = (chart.canvas.offsetLeft + tooltip.caretX) - tooltipEl.clientWidth - 6 + 'px';
              tooltipEl.style.top = (chart.canvas.offsetTop + tooltip.caretY) - tooltipEl.clientHeight - 6 + 'px';
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    this.chart = new Chart(ctx, merge({}, defaultOptions, options));
  }
}

export default BaseChart;
