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

class ChartSalesArea extends BaseDoubleChart {
  constructor(ctx, addOptions = {}) {
    super(ctx, {
      topCanvasId: 'chart-sales-area-top',
      bottomCanvasId: 'chart-sales-area-bottom',
      topCanvasStyle: 'min-height: 300px;',
      bottomCanvasStyle: 'min-height: 200px;',
      ...addOptions
    });

    this._loader = new Loader(this.wpChart, {
      id: 'loader-chart-sales-area',
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
    elPlan.textContent = plan + ' м²'
    elFact.textContent = fact + ' м²'

    if (fact < plan) {
      elFact.style.color = '#E03D3D'
    } else {
      elFact.style.color = '#37b456'
    }

    // Обработка данных сравнения
    const comparisonSection = tooltipEl.querySelector('.comparison-data')
    if (this.topChart.data.datasets.length > 2) {
      const planComparison = this.topChart.data.datasets[2].data[dataI]
      const factComparison = this.topChart.data.datasets[3].data[dataI]

      const elPlanComparison = tooltipEl.querySelector('.plan-comparison')
      const elFactComparison = tooltipEl.querySelector('.fact-comparison')

      elPlanComparison.textContent = planComparison + ' м²'
      elFactComparison.textContent = factComparison + ' м²'

      if (factComparison < planComparison) {
        elFactComparison.style.color = '#E03D3D'
      } else {
        elFactComparison.style.color = '#9333EA'
      }

      comparisonSection.classList.remove('hidden')
    } else {
      comparisonSection.classList.add('hidden')
    }

    if (this.moreFinances && this.moreFinances.length) {
      const skladBlock = tooltipEl.querySelector('.sklad')
      skladBlock.classList.remove('hidden')
      skladBlock.innerHTML = ''
      this.moreFinances.forEach(({ warehouse_short_name, finance_planfact }) => {
        const data = finance_planfact[dataI]
        skladBlock.insertAdjacentHTML('beforeend', `<p>${warehouse_short_name}: ${data.inflow_area_accumulated} м²</p>`)
      })
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
    elPlan.textContent = plan + ' м²'
    elFact.textContent = fact + ' м²'
    if (fact < plan) {
      elFact.style.color = '#E03D3D'
    } else {
      elFact.style.color = '#37b456'
    }

    // Обработка данных сравнения
    const comparisonSection = tooltipEl.querySelector('.comparison-data')
    if (this.bottomChart.data.datasets.length > 2) {
      const planComparison = this.bottomChart.data.datasets[2].data[dataI] * (-1)
      const factComparison = this.bottomChart.data.datasets[3].data[dataI] * (-1)

      const elPlanComparison = tooltipEl.querySelector('.plan-comparison')
      const elFactComparison = tooltipEl.querySelector('.fact-comparison')

      elPlanComparison.textContent = planComparison + ' м²'
      elFactComparison.textContent = factComparison + ' м²'

      if (factComparison < planComparison) {
        elFactComparison.style.color = '#E03D3D'
      } else {
        elFactComparison.style.color = '#9333EA'
      }

      comparisonSection.classList.remove('hidden')
    } else {
      comparisonSection.classList.add('hidden')
    }

    if (this.moreFinances && this.moreFinances.length) {
      const skladBlock = tooltipEl.querySelector('.sklad')
      skladBlock.classList.remove('hidden')
      skladBlock.innerHTML = ''
      this.moreFinances.forEach(({ warehouse_short_name, finance_planfact }) => {
        const data = finance_planfact[dataI]
        skladBlock.insertAdjacentHTML('beforeend', `<p>${warehouse_short_name}: ${data.inflow_area} м²</p>`)
      })
    }
  }

  render([_, { finance_planfact }], options = {}) {
    this.topChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    this.topChart.data.datasets[0].data = finance_planfact.map(obj => obj.inflow_area_accumulated_planned);
    this.topChart.data.datasets[1].data = finance_planfact.map(obj => obj.inflow_area_accumulated);

    this.bottomChart.data.labels = finance_planfact.map(obj => dateFormatter(obj.data, 'dd.MM'));
    // Инвертируем значения в отрицательные для отображения вниз от базовой линии
    this.bottomChart.data.datasets[0].data = finance_planfact.map(obj => -obj.inflow_area_planned);

    // Данные для столбцов с динамическим цветом
    const revenueData = finance_planfact.map(obj => -obj.inflow_area);
    const colors = finance_planfact.map(obj =>
      obj.inflow_area >= obj.inflow_area_planned ? '#19D06D' : '#E03D3D'
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

  // Добавление данных сравнения в графики
  addComparisonData({ finance_planfact }) {
    if (!finance_planfact || !finance_planfact.length) return;

    // Градиенты для данных сравнения
    const gradientOrange = this.createLinearGradient(this.topCanvas, 'rgba(255, 165, 0, 0.2)', 'rgba(255, 165, 0, 0.05)', 200);
    const gradientPurple = this.createLinearGradient(this.topCanvas, 'rgba(147, 51, 234, 0.3)', 'rgba(147, 51, 234, 0.05)', 200);

    // Верхний график - добавляем или обновляем datasets сравнения
    if (this.topChart.data.datasets.length > 2) {
      // Обновляем существующие datasets
      this.topChart.data.datasets[2].data = finance_planfact.map(obj => obj.inflow_area_accumulated_planned);
      this.topChart.data.datasets[3].data = finance_planfact.map(obj => obj.inflow_area_accumulated);
    } else if (this.topChart.data.datasets.length === 2) {
      // Создаем новые datasets
      this.topChart.data.datasets.push(
        {
          label: 'План (сравнение)',
          data: finance_planfact.map(obj => obj.inflow_area_accumulated_planned),
          borderColor: '#FFA500',
          backgroundColor: gradientOrange,
          color: '#FFA500',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#FFA500',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Факт (сравнение)',
          data: finance_planfact.map(obj => obj.inflow_area_accumulated),
          borderColor: '#9333EA',
          backgroundColor: gradientPurple,
          color: '#9333EA',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#9333EA',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      );
    }

    // Нижний график - добавляем или обновляем datasets сравнения
    const areaDataComparison = finance_planfact.map(obj => -obj.inflow_area);
    const colorsComparison = finance_planfact.map(obj =>
      obj.inflow_area >= obj.inflow_area_planned ? '#9333EA' : '#FFA500'
    );

    if (this.bottomChart.data.datasets.length > 2) {
      // Обновляем существующие datasets
      this.bottomChart.data.datasets[2].data = finance_planfact.map(obj => -obj.inflow_area_planned);
      this.bottomChart.data.datasets[3].data = areaDataComparison;
      this.bottomChart.data.datasets[3].backgroundColor = colorsComparison;
    } else if (this.bottomChart.data.datasets.length === 2) {
      // Создаем новые datasets
      this.bottomChart.data.datasets.push(
        {
          label: 'План (сравнение)',
          type: 'line',
          data: finance_planfact.map(obj => -obj.inflow_area_planned),
          borderColor: '#FFA500',
          color: '#FFA500',
          backgroundColor: 'transparent',
          borderWidth: 1,
          fill: false,
          tension: 0.2,
          pointRadius: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#FFA500',
          pointBorderWidth: 2,
        },
        {
          label: 'Факт (сравнение)',
          type: 'bar',
          data: areaDataComparison,
          backgroundColor: colorsComparison,
          borderRadius: 2,
          barThickness: 8,
        }
      );
    }

    this.topChart.update();
    this.bottomChart.update();
  }

  // Удаление данных сравнения из графиков
  removeComparisonData() {
    // Удаляем datasets сравнения если они есть
    if (this.topChart.data.datasets.length > 2) {
      this.topChart.data.datasets.splice(2);
    }
    if (this.bottomChart.data.datasets.length > 2) {
      this.bottomChart.data.datasets.splice(2);
    }

    this.topChart.update();
    this.bottomChart.update();
  }
}

export default ChartSalesArea;
