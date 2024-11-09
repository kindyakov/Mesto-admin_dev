import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { api } from "../../../settings/api.js"
import { dateFormatter } from "../../../settings/dateFormatter.js"
import { formattingPrice } from "../../../utils/formattingPrice.js"


function formatePrice(value) {
  if (!value) return ''
  const units = ['', 'тыс.', 'млн.', 'млрд.', 'трлн.']
  let unitIndex = 0

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000
    unitIndex++
  }

  return value.toFixed(0) + ' ' + units[unitIndex]
}

class ChartRevenue extends BaseChart {
  constructor(ctx, addOptions) {
    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.2)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Факт',
          data: [],
          borderColor: '#19D06D',
          color: '#19D06D',
          pointBackgroundColor: '#fff',
          pointRadius: 2,
          fill: true,
          tension: 0.6
        }, {
          label: 'План',
          data: [],
          borderColor: '#3D50E0',
          color: '#3D50E0',
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          pointRadius: 2,
          fill: true,
          tension: 0.6
        }]
      },
      options: {
        scales: {
          y: {
            ticks: {
              font: {
                size: 11,
              },
              callback: function (value, index, values) {
                return formatePrice(value);
              }
            }
          },
          x: {
            ticks: {
              minRotation: 60,
              font: {
                size: 10,
              },
            }
          },
        },
        plugins: {
          tooltip: {
            mode: 'index', // Показ по оси X, не по точкам
            intersect: false // Чтобы tooltip показывался вне пересечения с точкой
          }
        },
        hover: {
          mode: 'index', // При наведении - также по оси X
          intersect: false
        }
      },
      plugins: [{
        id: 'verticalLine', // Уникальный идентификатор плагина
        afterDraw: (chart) => {
          if (chart.tooltip._active && chart.tooltip._active.length) {
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
      }]
    }

    super(ctx, merge({}, defaultOptions, addOptions));
    this.ctx = ctx
  }

  calc(dataDashboard, finance_planfact) {
    const planMonthValue = this.wpChart.querySelector('.plan-month-value')
    const deltaValue = this.wpChart.querySelector('.delta-value')
    const btnSetPlan = this.wpChart.querySelector('.btn-set-plan')

    const [currentD] = finance_planfact.filter(obj => new Date(obj.data).toDateString() == new Date().toDateString())
    const data = currentD ? currentD : finance_planfact.at(-1)

    const fact = data.revenue_accumulated || 0
    const plan = data.revenue_accumulated_planned || 0
    const delta = fact - plan

    this.wpChart.querySelector('.fact-value').innerText = formattingPrice(fact)
    this.wpChart.querySelector('.plan-value').innerText = formattingPrice(plan)
    planMonthValue.value = formattingPrice(finance_planfact.at(-1).revenue_accumulated_planned)
    deltaValue.innerText = formattingPrice(delta)

    if (delta > 0) {
      deltaValue.classList.add('text-success')
    } else if (delta == 0) {
      deltaValue.classList.add('text-warning')
    } else {
      deltaValue.classList.add('text-error')
    }

    btnSetPlan.addEventListener('click', () => {
      if (planMonthValue.value) {
        planMonthValue.style.backgroundColor = ''
        this.setFinancePlan({
          revenue_planned: planMonthValue.value.replace(/\D/g, ''),
          data: data.data,
          month_or_day: 'month'
        })
      } else {
        planMonthValue.style.backgroundColor = '#ffdbdb'
      }
    })
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formattingPrice(parseFloat(el.innerText))
    })
  }

  render([dataDashboard, { finance_planfact = [] }]) {
    this.chart.data.labels = finance_planfact.length ? finance_planfact.map((obj, i) => dateFormatter(obj.data, 'dd.MM')) : []
    this.chart.data.datasets[0].data = finance_planfact.length ? finance_planfact.map(obj => obj.revenue_accumulated) : []
    this.chart.data.datasets[1].data = finance_planfact.length ? finance_planfact.map(obj => obj.revenue_accumulated_planned) : []

    const [currentD] = finance_planfact.filter(obj => new Date(obj.data).toDateString() == new Date().toDateString())
    const data = currentD ? currentD : finance_planfact.at(-1)

    const circle = this.wpChart.querySelector('._circle.fact')
    let gradient, borderColor, color

    if (data.revenue_accumulated > data.revenue_accumulated_planned) {
      gradient = this.createLinearGradient('rgba(206, 254, 228, 0.4)', 'rgba(206, 254, 228, 0.8)')
      borderColor = color = '#19D06D'
    } else if (data.revenue_accumulated > data.revenue_accumulated_planned) {
      gradient = this.createLinearGradient('rgba(255, 253, 205, 0.4)', 'rgba(255, 253, 205, 0.8)')
      borderColor = color = '#FFF95F'
    } else {
      gradient = this.createLinearGradient('rgba(255, 207, 207, 0.4)', 'rgba(255, 207, 207, 0.8)')
      borderColor = color = '#E03D3D'
    }

    this.chart.data.datasets[0].backgroundColor = gradient
    this.chart.data.datasets[0].borderColor = borderColor
    this.chart.data.datasets[0].color = color
    circle.style.color = color

    this.calc(dataDashboard, finance_planfact)

    this.chart.update()
  }

  async setFinancePlan(data) {
    try {
      this.loader.enable()
      const response = await api.post(`/_set_finance_plan_`, data)
      if (response.status !== 200) return
      window.app.notify.show(response.data)
    } catch (error) {
      throw error;
    } finally {
      this.loader.disable()
    }
  }
}

export default ChartRevenue