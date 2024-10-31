import { formattingPrice } from "../../../utils/formattingPrice.js"
import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'

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

class ChartRegistrationFees extends BaseChart {
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
              font: {
                size: 11,
              },
            }
          },
        },
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions));
    this.ctx = ctx
  }

  calc(dataDashboard, finance_planfact) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const days_number = new Date(year, month + 1, 0).getDate();

    const [currentD] = finance_planfact.filter((d, i) => (i + 1) == days_number)
    const fact = currentD?.revenue_new_accumulated || 0
    const plan = (dataDashboard.reestr_sum / finance_planfact.length * days_number) || 0
    const delta = currentD.revenue_reestr_accumulated - dataDashboard.reestr_sum / finance_planfact.length * days_number

    const deltaValue = this.wpChart.querySelector('.delta-value')

    this.wpChart.querySelector('.fact-value').innerText = formattingPrice(fact)
    this.wpChart.querySelector('.plan-value').innerText = formattingPrice(plan)
    deltaValue.innerText = formattingPrice(delta)

    if (delta > 0) {
      deltaValue.classList.add('text-success')
    } else if (delta == 0) {
      deltaValue.classList.add('text-warning')
    } else {
      deltaValue.classList.add('text-error')
    }   
  }

  render([dataDashboard, { finance_planfact = [] }]) {
    this.chart.data.labels = finance_planfact.length ? finance_planfact.map((obj, i) => (i + 1)) : []
    this.chart.data.datasets[0].data = finance_planfact.length ? finance_planfact.map(obj => obj.revenue_reestr_accumulated) : []
    this.chart.data.datasets[1].data = finance_planfact.length ? finance_planfact.map((obj, i) => ((i + 1) + dataDashboard.reestr_sum / finance_planfact.length * (i + 1)).toFixed(0)) : []

    const circle = this.wpChart.querySelector('.circle.fact')
    let gradient, borderColor, color

    if (this.chart.data.datasets[0].data.at(-1) > this.chart.data.datasets[1].data.at(-1)) {
      gradient = this.createLinearGradient('rgba(206, 254, 228, 0.4)', 'rgba(206, 254, 228, 0.8)')
      borderColor = color = '#19D06D'
    } else if (this.chart.data.datasets[0].data.at(-1) == this.chart.data.datasets[1].data.at(-1)) {
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
}

export default ChartRegistrationFees