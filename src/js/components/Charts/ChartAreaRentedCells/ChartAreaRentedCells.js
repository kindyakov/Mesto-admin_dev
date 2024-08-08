import BaseChart from "../BaseChart.js";
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';

class ChartAreaRentedCells extends BaseChart {
  constructor(ctx, addOptions) {

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'], // Все дни месяца
        datasets: [{
          label: 'Факт',
          data: [], // Замените на ваши фактические данные
          borderColor: '#3c50e0',
          color: '#3c50e0',
          pointBackgroundColor: '#fff',
          // backgroundColor: gradient,
          pointRadius: 3,
          fill: true,
          tension: 0.6
        }, {
          label: 'План',
          data: [], // Замените на ваши данные плана
          borderColor: '#6f7d90',
          color: '#6f7d90',
          pointRadius: 0,
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          borderWidth: 2,
          borderDash: [5, 5], // Пунктирная линия
          fill: false,
          tension: 0.6
        }]
      },
      options: {
        scales: {
          x: {
            ticks: {
              minRotation: 90,
              font: {
                size: 10,
              },
              callback: function (value, index, values) {
                const [y, m, d] = this.chart.data.labels[index].split('-')

                return !d || !m ? '' : `${d}-${m}`; // Число и месяц в две строки
              }
            }
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            // mode: 'index',
            // intersect: true
          },
          // Для заштрихованной области можно использовать плагин, например, chartjs-plugin-annotation
        }
      },
    }

    super(ctx, merge({}, defaultOptions, addOptions));

    this.datasets = {
      plan: () => {
        this.chart.data.datasets[0].hidden = true;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
      fact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = true;
        this.chart.update();
      },
      planFact: () => {
        this.chart.data.datasets[0].hidden = false;
        this.chart.data.datasets[1].hidden = false;
        this.chart.update();
      },
    };

    this.selects = new Select({ uniqueName: 'select-chart-area-rented-cells', selectMinWidth: 125 });
    this.selects.onChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }

  onExternal(tooltipEl, chart, tooltip) {
    const dataI = tooltip.dataPoints[0].dataIndex
    const date = chart.data.labels[dataI]
    const values = tooltipEl.querySelectorAll('.value')
    values.forEach(val => val.innerText = val.innerText + ' м²')
    tooltipEl.insertAdjacentHTML('afterbegin', `<div><svg class="icon icon-calendar" style="width: 12px; height: 12px; fill: gray; margin-right: 2px;"><use xlink:href="img/svg/sprite.svg#calendar"></use></svg><span style="font-size: 12px; text-align: center;">${dateFormatter(date)}</span></div>`)
  }

  render({ finance_planfact = [] }) {
    this.chart.data.labels = finance_planfact.length ? finance_planfact.map(obj => obj.data) : []
    this.chart.data.datasets[0].data = finance_planfact.length ? finance_planfact.map(obj => obj.inflow_area) : []
    this.chart.data.datasets[1].data = finance_planfact.length ? finance_planfact.map(obj => obj.inflow_area_planned) : []
    this.chart.update()
  }
}

export default ChartAreaRentedCells