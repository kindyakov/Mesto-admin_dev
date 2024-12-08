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
    }

    super(ctx, merge({}, defaultOptions, addOptions));
    this.ctx = ctx
    this.dataPlan = {}
    this.planMonthValue = this.wpChart.querySelector('.plan-month-value')

    const btnSetPlan = this.wpChart.querySelector('.btn-set-plan')
    btnSetPlan.addEventListener('click', () => this.handleClickBtnSetPlan())
  }

  calc(dataDashboard, finance_planfact) {
    const deltaValue = this.wpChart.querySelector('.delta-value')

    const [currentD] = finance_planfact.filter(obj => new Date(obj.data).toDateString() == new Date().toDateString())
    this.dataPlan = currentD ? currentD : finance_planfact.at(-1)

    const fact = this.dataPlan.revenue_accumulated || 0
    const plan = this.dataPlan.revenue_accumulated_planned || 0
    const delta = fact - plan

    this.wpChart.querySelector('.fact-value').innerText = formattingPrice(fact)
    this.wpChart.querySelector('.plan-value').innerText = formattingPrice(plan)
    this.planMonthValue.value = formattingPrice(finance_planfact.at(-1).revenue_accumulated_planned)
    deltaValue.innerText = formattingPrice(delta)

    if (delta > 0) {
      deltaValue.classList.add('text-success')
    } else if (delta == 0) {
      deltaValue.classList.add('text-warning')
    } else {
      deltaValue.classList.add('text-error')
    }
  }

  handleClickBtnSetPlan() {
    if (this.planMonthValue.value) {
      this.planMonthValue.style.backgroundColor = ''
      this.setFinancePlan({
        revenue_planned: this.planMonthValue.value.replace(/\D/g, ''),
        data: this.dataPlan.data,
        month_or_day: 'month'
      })
    } else {
      this.planMonthValue.style.backgroundColor = '#ffdbdb'
    }
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