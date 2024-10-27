import Dashboards from "../Dashboards.js";
import TableUpcomingPayments from "../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js"
import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
import { getDashboardFinance, getFuturePayments, getFinancePlan } from "../../../settings/request.js";
import RangeSlider from "../../../components/RangeSlider/RangeSlider.js";

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

    console.log(finance_planfact)

    if (finance_planfact?.length) {
      finance_planfact.map(({ data, revenue }) => {

      })
    }

    this.rangeFact = new RangeSlider(this.wrapper.querySelector('.range-fact'), {
      start: 27,
      connect: true,
      range: {
        'min': 1,
        'max': 31
      },
      tooltips: true,
      pips: {
        mode: 'count',
        values: 31,
        density: 3,
        stepped: true
      }
    })

    this.rangePlan = new RangeSlider(this.wrapper.querySelector('.range-plan'), {
      start: 20,
      connect: true,
      range: {
        'min': 0,
        'max': 31
      },
      tooltips: true,
      pips: {
        mode: 'count',
        values: 31,
        density: 3,
        stepped: true
      }
    })
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