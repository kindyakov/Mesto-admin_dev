import Dashboards from "../Dashboards.js";
import TableUpcomingPayments from "../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js"
import ChartMonthlyRevenue from "../../../components/Charts/ChartMonthlyRevenue/ChartMonthlyRevenue.js";
import { getDashboardFinance, getFuturePayments, getFinancePlan } from "../../../settings/request.js";

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


  onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
    this.renderWidgets(dataDashboard)
    this.actionsCharts(chart => chart.render(finance_planfact))

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
    }
  }
}

export default Finance