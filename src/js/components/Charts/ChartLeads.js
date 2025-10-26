// 
import Chart from 'chart.js/auto';
import BaseDoubleChart from './BaseDoubleChart.js';
import { dateFormatter } from "../../settings/dateFormatter.js";
import { Loader } from "../../modules/myLoader.js";
import { formattingPrice } from '../../utils/formattingPrice.js';

// Функция форматирования цены
function formatePriceType(value) {
  if (!value) return '';
  const units = ['', 'тыс.', 'млн.', 'млрд.', 'трлн.'];
  let unitIndex = 0;

  while (Math.abs(value) >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return value.toFixed(0) + ' ' + units[unitIndex];
}

class ChartLeads extends BaseDoubleChart {
  constructor(ctx, addOptions = {}) {
    super(ctx, {
      topCanvasId: 'chart-leads-top',
      bottomCanvasId: 'chart-leads-bottom',
      topCanvasStyle: 'min-height: 300px;',
      bottomCanvasStyle: 'min-height: 200px;',
      ...addOptions
    });

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-leads',
    });

    // Инициализация графиков
    this.initTopChart();
    this.initBottomChart();
  }

  // Верхний график - линии План/Факт
  initTopChart() {
    const gradientBlue = this.createLinearGradient(this.topCanvas, 'rgba(61, 80, 224, 0.2)', 'rgba(61, 80, 224, 0.05)', 200);
    const gradientRed = this.createLinearGradient(this.topCanvas, 'rgba(224, 61, 61, 0.3)', 'rgba(224, 61, 61, 0.05)', 200);

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
            color: '#3D50E0',
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
            color: '#E03D3D',
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
                return formatePriceType(value);
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
              lineWidth: 1
            },
            border: { width: 0 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: this.getTooltipConfig(this.onTopExternal.bind(this))
        },
        hover: this.getHoverConfig()
      },
      plugins: [this.createVerticalLinePlugin()]
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
            color: '#3D50E0',
            backgroundColor: 'transparent',
            borderWidth: 1,
            fill: false,
            tension: 0.2,
            pointRadius: 2,
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
                return formatePriceType(Math.abs(value));
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
              display: false
            },
            grid: {
              display: false
            },
            border: { width: 0 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: this.getTooltipConfig(this.onBottomExternal.bind(this))
        },
        hover: this.getHoverConfig()
      }
    };

    this.bottomChart = new Chart(this.bottomCanvas, defaultOptions);
  }

  // Дополнительная обработка tooltip для верхнего графика
  onTopExternal(tooltipEl, chart, tooltip, dataI) {
    const date = this.topChart.data.labels[dataI]
    const plan = this.topChart.data.datasets[0].data[dataI]
    const fact = this.topChart.data.datasets[1].data[dataI]

    const elDate = tooltipEl.querySelector('.date')
    const elPlan = tooltipEl.querySelector('.plan')
    const elFact = tooltipEl.querySelector('.fact')

    elDate.textContent = date
    elPlan.textContent = plan
    elFact.textContent = fact

    if (fact < plan) {
      elFact.style.color = '#E03D3D'
    } else {
      elFact.style.color = '#37b456'
    }
  }

  // Дополнительная обработка tooltip для нижнего графика
  onBottomExternal(tooltipEl, chart, tooltip, dataI) {
    const date = this.bottomChart.data.labels[dataI]
    const plan = this.bottomChart.data.datasets[0].data[dataI] * (-1)
    const fact = this.bottomChart.data.datasets[1].data[dataI] * (-1)

    const elDate = tooltipEl.querySelector('.date')
    const elPlan = tooltipEl.querySelector('.plan')
    const elFact = tooltipEl.querySelector('.fact')

    elDate.textContent = date
    elPlan.textContent = plan
    elFact.textContent = fact
    if (fact < plan) {
      elFact.style.color = '#E03D3D'
    } else {
      elFact.style.color = '#37b456'
    }
  }

  render([_, { finance_planfact }], options = {}) {
    this.topChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    this.topChart.data.datasets[0].data = finance_planfact.map(obj => obj.leads_accumulated_planned);
    this.topChart.data.datasets[1].data = finance_planfact.map(obj => obj.leads_accumulated_fact);

    this.bottomChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    // Инвертируем значения в отрицательные для отображения вниз от базовой линии
    this.bottomChart.data.datasets[0].data = finance_planfact.map(obj => -obj.leads_planned);

    // Данные для столбцов с динамическим цветом
    const revenueData = finance_planfact.map(obj => -obj.leads_fact);
    const colors = finance_planfact.map(obj =>
      obj.leads_fact >= obj.leads_planned ? '#19D06D' : '#E03D3D'
    );

    this.bottomChart.data.datasets[1].data = revenueData;
    this.bottomChart.data.datasets[1].backgroundColor = colors;

    // Сохраняем дополнительные данные для tooltip (если переданы)
    if (options.extraData) {
      this.extraData = options.extraData;
    }

    this.topChart.update();
    this.bottomChart.update();
  }
}

export default ChartLeads;
