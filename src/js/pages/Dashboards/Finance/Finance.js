import Dashboards from "../Dashboards.js";
import TableUpcomingPayments from "../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js"
import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
import { getDashboardFinance, getFuturePayments, getFinancePlan } from "../../../settings/request.js";
import RangeSlider from "../../../components/RangeSlider/RangeSlider.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";

function getFirstAndLastDayOfMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Создаем дату для первого дня месяца
  const firstDay = new Date(year, month, 1);

  // Создаем дату для следующего месяца и вычитаем один день,
  // чтобы получить последний день текущего месяца
  const lastDay = new Date(year, month + 1, 0);

  return [firstDay, lastDay]
}

class Finance extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-payments',
          TableComponent: TableUpcomingPayments,
          params: { getData: getFuturePayments }
        }
      ],
      charts: [
        { id: 'chart-monthly-revenue', ChartComponent: ChartMonthlyRevenue },
      ],
      page: 'dashboards/finance'
    });

  }

  async getData(queryParams = {}) {
    return getFuturePayments({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams });
  }

  async getDashboardData(queryParams = {}) {
    return Promise.all([getDashboardFinance({ ...this.queryParams, ...queryParams }), getFinancePlan(queryParams)])
  }


  initRanges({ dataDashboard, finance_planfact, dataEntities }) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // месяц начинается с 0
    const lastDayOfCurrentMonth = new Date(year, month + 1, 0);
    let revenue = 0

    const options = {
      start: today.getDate(),
      connect: true,
      step: 1,
      range: {
        'min': 1,
        'max': lastDayOfCurrentMonth.getDate()
      },
      tooltips: true,
      pips: {
        mode: 'count',
        values: 31,
        density: 3,
        stepped: true
      },
      // format: {
      //   to: value => {
      //     console.log(value)

      //     return value
      //   },
      //   // from: value => +value.toFixed(0)
      // },
    }

    if (dataDashboard?.revenue_by_month.length) {
      this.rangeFact = new RangeSlider(this.wrapper.querySelector('.range-fact'), options)
      const tooltip = this.rangeFact.sliderElement.querySelector('.noUi-tooltip')
      const [data] = dataDashboard.revenue_by_month.filter(item => {
        const date = new Date(item.month);
        return date.getFullYear() === year && (date.getMonth()) === month;
      });
      if (data) {
        revenue = data.revenue
        tooltip.innerText = formattingPrice(revenue)
      }
    }

    if (finance_planfact?.length) {
      const filteredData = finance_planfact.filter(item => {
        const date = new Date(item.data);
        return date.getFullYear() === year && (date.getMonth()) === month;
      });

      const dailyRevenues = new Array(31).fill(0);
      let cumulativeRevenue = 0;

      filteredData.forEach((item, i) => {
        cumulativeRevenue += item.revenue;
        dailyRevenues[i] = cumulativeRevenue;
      });

      this.rangePlan = new RangeSlider(this.wrapper.querySelector('.range-plan'), options)

      function update({ values, handle, noUiSlider }) {
        const tooltip = noUiSlider.target?.querySelector('.noUi-tooltip') || noUiSlider.sliderElement.querySelector('.noUi-tooltip')
        const value = dailyRevenues[+Math.round(values[handle]) - 1];
        tooltip.innerText = formattingPrice(value)
        if (revenue => value) {
          tooltip.style.cssText = `color: #0b704e; background-color: #cff1e6;`
        } else {
          tooltip.style.cssText = `color: #d42424; background-color: #ffdbdb;`
        }
      }

      update({ values: [today.getDate()], handle: 0, noUiSlider: this.rangePlan })

      this.rangePlan.onSliderUpdate = update
    }
  }

  onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
    this.renderWidgets(dataDashboard)
    this.actionsCharts(chart => chart.render(finance_planfact))

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
    }

    this.initRanges({ dataDashboard, finance_planfact, dataEntities })
  }
}

export default Finance