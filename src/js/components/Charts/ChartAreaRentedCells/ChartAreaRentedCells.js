import BaseChart from "../BaseChart.js";
import merge from 'lodash.merge'
import { Select } from '../../../modules/mySelect.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { createCalendar } from "../../../settings/createCalendar.js";
import {getFinancePlan} from '../../../settings/request.js';


class ChartAreaRentedCells extends BaseChart {
  constructor(ctx, addOptions, app) {

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.1)');
    gradient.addColorStop(1, 'rgba(60, 80, 224, 0.01)');

    const defaultOptions = {
      type: 'line',
      data: {
        labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'], // Все дни месяца
        datasets: [{
          label: 'Факт',
          data: [],
          borderColor: '#3c50e0',
          color: '#3c50e0',
          pointBackgroundColor: '#fff',
          // backgroundColor: gradient,
          pointRadius: 2,
          fill: true,
          tension: 0.6
        }/*, {
          label: 'План',
          data: [],
          borderColor: '#6f7d90',
          color: '#6f7d90',
          pointRadius: 0,
          pointBackgroundColor: '#fff',
          backgroundColor: gradient,
          borderWidth: 2,
          borderDash: [5, 5], // Пунктирная линия
          fill: false,
          tension: 0.6
        }*/]
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
    console.log(this.defaultDate)
    this.calendars = createCalendar(`.input-date-filter-chart-area-rented-cells`, {
      mode: 'range',
      dateFormat: 'd. M, Y',
      //defaultDate: app.defaultDate,
      onChange: async (selectedDates, dateStr, instance) => {
      if (selectedDates.length === 2) {
        const data = await getFinancePlan({warehouse_id: window.app.warehouse.warehouse_id,
        //  this.app.defaultDate = selectedDates;
        //  this.changeQueryParams({
        start_date: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
        end_date: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
        });
        this.render(data)
      }
      }
    });
    console.log(this.calendars)
    /*
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
    */
  }
  /*
  handleSelectChange(e, select, value) {
    if (this.datasets[value]) {
      this.datasets[value]();
    }
  }
  */
  onExternal(tooltipEl, chart, tooltip) {
    const dataI = tooltip.dataPoints[0].dataIndex
    const date = chart.data.labels[dataI]
    const values = tooltipEl.querySelectorAll('.value')
    values.forEach(val => {
      val.innerText = parseFloat(val.innerText).toFixed(1) + ' м²'
    })

    tooltipEl.insertAdjacentHTML('afterbegin', `<div><svg class="icon icon-calendar" style="width: 12px; height: 12px; fill: gray; margin-right: 2px;"><use xlink:href="img/svg/sprite.svg#calendar"></use></svg><span style="font-size: 12px; text-align: center;">${dateFormatter(date)}</span></div>`)
  }

  render({ finance_planfact = [] }) {
    this.chart.data.labels = finance_planfact.length ? finance_planfact.map(obj => obj.data) : []
    this.chart.data.datasets[0].data = finance_planfact.length ? finance_planfact.map(obj => obj.rented_area) : []
    //this.chart.data.datasets[1].data = finance_planfact.length ? finance_planfact.map(obj => obj.rented_area_planned) : []
    this.chart.update()

    const [startDate, endDate] = [
      finance_planfact[0].data,
      finance_planfact.at(-1).data
    ]
    this.calendars.element.value = `${dateFormatter(startDate, 'dd. LLLL, yyyy')} - ${dateFormatter(endDate, 'dd. LLLL, yyyy')}`
  }
}

export default ChartAreaRentedCells