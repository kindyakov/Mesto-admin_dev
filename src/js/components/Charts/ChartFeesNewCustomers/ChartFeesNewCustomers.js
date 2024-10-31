import BaseChart from "../BaseChart.js"
import merge from 'lodash.merge'
import { formattingPrice } from "../../../utils/formattingPrice.js"
import { createElement } from '../../../settings/createElement.js';
import { api } from "../../../settings/api.js"
import { buildQueryParams } from "../../../utils/buildQueryParams.js";

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

class ChartFeesNewCustomers extends BaseChart {
  constructor(ctx, addOptions) {
    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.2)');
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
          // backgroundColor: gradient,
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
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            position: 'average',
            external: context => {
              const { chart, tooltip } = context;
              const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');

              if (!tooltipEl) return;

              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              tooltipEl.innerHTML = '';

              // Получаем индекс данных по оси X, даже если курсор не наведен на точку
              const xValue = chart.scales.x.getValueForPixel(tooltip.caretX);
              const dataI = Math.floor(xValue);

              // Проверка, что индекс данных в пределах массива
              if (dataI >= 0 && dataI < chart.data.labels.length) {
                chart.data.datasets.forEach(obj => {
                  const el = createElement('div', {
                    content: `<b style="background: ${obj.color};"></b><span class="value">${obj.data[dataI]}</span>`
                  });
                  tooltipEl.appendChild(el);
                });

                tooltipEl.style.opacity = 1;
                tooltipEl.style.left = `${chart.canvas.offsetLeft + tooltip.caretX - tooltipEl.clientWidth - 6}px`;
                tooltipEl.style.top = `${chart.canvas.offsetTop + tooltip.caretY - tooltipEl.clientHeight - 6}px`;

                this.onExternal(tooltipEl, chart, tooltip);
              }
            }
          }
        },
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions));
    this.ctx = ctx

    // this.chart.canvas.addEventListener('mousemove', (event) => {
    //   const { offsetX, offsetY } = event;
    //   const xScale = this.chart.scales.x;
    //   const yScale = this.chart.scales.y;

    //   if (offsetY >= yScale.top && offsetY <= yScale.bottom) {
    //     // Генерация данных для tooltip на уровне оси Y
    //     const tooltip = {
    //       caretX: offsetX,
    //       caretY: offsetY,
    //       opacity: 1,
    //       dataPoints: [{
    //         dataIndex: xScale.getValueForPixel(offsetX)
    //       }]
    //     };

    //     this.chart.tooltip.positioners.average = () => tooltip;
    //     this.chart.tooltip.update();
    //   }
    // });

  }

  calc(dataDashboard, finance_planfact) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const days_number = new Date(year, month + 1, 0).getDate();

    const planValue = this.wpChart.querySelector('.plan-value')
    const deltaValue = this.wpChart.querySelector('.delta-value')
    const btnSetPlan = this.wpChart.querySelector('.btn-set-plan')

    const [currentD] = finance_planfact.filter((d, i) => (i + 1) == days_number)
    const fact = currentD?.revenue_new_accumulated || 0
    const plan = currentD?.revenue_accumulated_planned || 0
    const delta = currentD.revenue_new_accumulated - currentD.revenue_accumulated_planned

    this.wpChart.querySelector('.fact-value').innerText = formattingPrice(fact)
    planValue.value = formattingPrice(plan)
    deltaValue.innerText = formattingPrice(delta)

    if (delta > 0) {
      deltaValue.classList.add('text-success')
    } else if (delta == 0) {
      deltaValue.classList.add('text-warning')
    } else {
      deltaValue.classList.add('text-error')
    }

    btnSetPlan.addEventListener('click', () => {
      if (planValue.value) {
        planValue.style.backgroundColor = ''
        this.setFinancePlan({
          revenue_planned: planValue.value.replace(/\D/g, ''),
          data: currentD.data,
          month_or_day: 'month'
        })
      } else {
        planValue.style.backgroundColor = '#ffdbdb'
      }
    })
  }

  onExternal(tooltipEl, chart, tooltip, dataI) {
    tooltipEl.querySelectorAll('.value')?.forEach(el => {
      el.innerText = formattingPrice(parseFloat(el.innerText))
    })
  }

  render([dataDashboard, { finance_planfact = [] }]) {
    this.chart.data.labels = finance_planfact.length ? finance_planfact.map((obj, i) => (i + 1)) : []
    this.chart.data.datasets[0].data = finance_planfact.length ? finance_planfact.map(obj => obj.revenue_new_accumulated) : []
    this.chart.data.datasets[1].data = finance_planfact.length ? finance_planfact.map(obj => obj.revenue_accumulated_planned) : []

    const circle = this.wpChart.querySelector('._circle.fact')
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

export default ChartFeesNewCustomers