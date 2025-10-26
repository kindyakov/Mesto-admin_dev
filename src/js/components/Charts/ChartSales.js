import Chart from 'chart.js/auto';
import merge from 'lodash.merge';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";
import { createElement } from '../../settings/createElement.js';

// Функция форматирования цены
function formatePrice(value) {
  if (!value) return '';
  const units = ['', 'тыс.', 'млн.', 'млрд.', 'трлн.'];
  let unitIndex = 0;

  while (Math.abs(value) >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return value.toFixed(0) + ' ' + units[unitIndex];
}

class ChartSales {
  constructor(ctx, addOptions = {}) {
    // Если ctx это canvas, заменяем его на контейнер
    if (ctx.tagName === 'CANVAS') {
      const parent = ctx.parentElement;
      ctx.remove();
      ctx = parent;
    }

    this.container = ctx;
    this.wpChart = this.container.closest('.wp-chart') || this.container;

    // Создаем контейнеры для графиков с тултипами
    const topContainer = document.createElement('div');
    topContainer.style.cssText = 'position: relative; margin-bottom: 10px;';

    const bottomContainer = document.createElement('div');
    bottomContainer.style.cssText = 'position: relative;';

    // Создаем два canvas элемента
    this.topCanvas = document.createElement('canvas');
    this.topCanvas.id = 'chart-sales-top';
    this.topCanvas.style.cssText = 'max-height: 200px;';

    this.bottomCanvas = document.createElement('canvas');
    this.bottomCanvas.id = 'chart-sales-bottom';
    this.bottomCanvas.style.cssText = 'max-height: 150px;';

    // Создаем тултипы для каждого графика
    this.topTooltip = document.createElement('div');
    this.topTooltip.className = 'chart-tooltip';
    this.topTooltip.style.cssText = 'opacity: 0; position: absolute; pointer-events: none;';

    this.bottomTooltip = document.createElement('div');
    this.bottomTooltip.className = 'chart-tooltip';
    this.bottomTooltip.style.cssText = 'opacity: 0; position: absolute; pointer-events: none;';

    // Собираем DOM структуру
    topContainer.appendChild(this.topCanvas);
    topContainer.appendChild(this.topTooltip);
    bottomContainer.appendChild(this.bottomCanvas);
    bottomContainer.appendChild(this.bottomTooltip);

    this.container.appendChild(topContainer);
    this.container.appendChild(bottomContainer);

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-sales',
    });

    this.app = window.app;

    // Инициализация графиков
    this.initTopChart();
    this.initBottomChart();
  }

  // Верхний график - линии План/Факт
  initTopChart() {
    const gradientBlue = this.topCanvas.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradientBlue.addColorStop(0, 'rgba(61, 80, 224, 0.2)');
    gradientBlue.addColorStop(1, 'rgba(61, 80, 224, 0.05)');

    const gradientRed = this.topCanvas.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradientRed.addColorStop(0, 'rgba(224, 61, 61, 0.3)');
    gradientRed.addColorStop(1, 'rgba(224, 61, 61, 0.05)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'План',
            data: [],
            borderColor: '#3D50E0',
            backgroundColor: gradientBlue,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#3D50E0',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Факт',
            data: [],
            borderColor: '#E03D3D',
            backgroundColor: gradientRed,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#E03D3D',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              font: { size: 10 },
              color: '#64748b',
              callback: function (value) {
                return formatePrice(value);
              }
            },
            border: { width: 0 }
          },
          x: {
            ticks: {
              font: { size: 9 },
              color: '#64748b',
              maxRotation: 0,
              minRotation: 0
            },
            border: { width: 0 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            position: 'average',
            external: context => {
              const { chart, tooltip } = context;
              const tooltipEl = this.topTooltip;

              if (!tooltipEl) return;
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              tooltipEl.innerHTML = '';

              const dataI = tooltip.dataPoints[0].dataIndex;

              chart.data.datasets.length && chart.data.datasets.forEach(obj => {
                const color = Array.isArray(obj.color) ? obj.color[dataI] : obj.color || obj.borderColor;

                const el = createElement('div', {
                  content: `${color ? `<b style="background: ${color};"></b>` : ''}<span class="value">${obj.data[dataI]}</span>`
                });

                tooltipEl.appendChild(el);
              });

              tooltipEl.style.opacity = 1;

              this.onPosExternal(tooltipEl, chart, tooltip, dataI);
              this.onTopExternal(tooltipEl, chart, tooltip, dataI);
            }
          }
        }
      },
      plugins: [{
        id: 'verticalLine',
        afterDraw: (chart) => {
          if (chart.tooltip._active && chart.tooltip._active.length) {
            const ctx = chart.ctx;
            ctx.save();

            const activePoint = chart.tooltip._active[0];
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.stroke();

            ctx.restore();
          }
        }
      }]
    };

    this.topChart = new Chart(this.topCanvas, defaultOptions);
  }

  // Нижний график - комбинированный (столбцы + линия)
  initBottomChart() {
    const defaultOptions = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'План',
            type: 'line',
            data: [],
            borderColor: '#3D50E0',
            backgroundColor: 'transparent',
            borderWidth: 1,
            fill: false,
            tension: 0,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3D50E0',
            pointBorderWidth: 2,
          },
          {
            label: 'Факт',
            type: 'bar',
            data: [],
            backgroundColor: [],
            borderRadius: 2,
            barThickness: 8,
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            max: 0,  // Верхняя граница (базовая линия)
            ticks: {
              font: { size: 10 },
              color: '#64748b',
              callback: function (value) {
                return formatePrice(Math.abs(value));
              }
            },
            grid: {
              color: '#f3f3f3',
              lineWidth: 1
            },
            border: { width: 0 }
          },
          x: {
            ticks: {
              font: { size: 9 },
              color: '#64748b',
              maxRotation: 0,
              minRotation: 0
            },
            grid: {
              color: '#f3f3f3',
              lineWidth: 1,
            },
            border: { width: 0 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            position: 'average',
            external: context => {
              const { chart, tooltip } = context;
              const tooltipEl = this.bottomTooltip;

              if (!tooltipEl) return;
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              tooltipEl.innerHTML = '';

              const dataI = tooltip.dataPoints[0].dataIndex;

              chart.data.datasets.length && chart.data.datasets.forEach(obj => {
                const color = Array.isArray(obj.color) ? obj.color[dataI] : obj.color || obj.borderColor;

                const el = createElement('div', {
                  content: `${color ? `<b style="background: ${color};"></b>` : ''}<span class="value">${Math.abs(obj.data[dataI])}</span>`
                });

                tooltipEl.appendChild(el);
              });

              tooltipEl.style.opacity = 1;

              this.onPosExternal(tooltipEl, chart, tooltip, dataI);
              this.onBottomExternal(tooltipEl, chart, tooltip, dataI);
            }
          }
        }
      }
    };

    this.bottomChart = new Chart(this.bottomCanvas, defaultOptions);
  }

  resizeChart() {
    if (this.topChart) {
      this.topChart.update('resize');
    }
    if (this.bottomChart) {
      this.bottomChart.update('resize');
    }
  }

  // Позиционирование тултипа (из BaseChart)
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

  // Дополнительная обработка для верхнего графика
  onTopExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formatePrice(parseFloat(el.innerText));
    });
  }

  // Дополнительная обработка для нижнего графика
  onBottomExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formatePrice(parseFloat(el.innerText));
    });
  }

  render([_, { finance_planfact }]) {
    this.topChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    this.topChart.data.datasets[0].data = finance_planfact.map(obj => obj.revenue_accumulated_planned)
    this.topChart.data.datasets[1].data = finance_planfact.map(obj => obj.revenue_accumulated)

    this.bottomChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    // Инвертируем значения в отрицательные для отображения вниз от базовой линии
    this.bottomChart.data.datasets[0].data = finance_planfact.map(obj => -obj.revenue_planned)

    // Данные для столбцов с динамическим цветом
    const revenueData = finance_planfact.map(obj => -obj.revenue);
    const colors = finance_planfact.map(obj =>
      obj.revenue >= obj.revenue_planned ? '#19D06D' : '#E03D3D'
    );

    this.bottomChart.data.datasets[1].data = revenueData;
    this.bottomChart.data.datasets[1].backgroundColor = colors;

    this.topChart.update();
    this.bottomChart.update();
  }
}

export default ChartSales