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
      page: 'finance'
    });
  }

  async getData(data = {}) {
    return getFuturePayments(data);
  }

  async getDashboardData(data = {}) {
    return Promise.all([getDashboardFinance(data), getFinancePlan(data)])
  }

  async renderDashboard(data) {
    try {
      this.loader.enable()
      const dataDashboard = await this.getDashboardData(data)
      const [dataWidgets = [], { finance_planfact = [] }] = dataDashboard

      this.renderWidgets(dataWidgets)
      this.actionsCharts(chart => chart.render(finance_planfact))
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async render() {
    try {
      this.loader.enable()
      const [dataDashboard = [], dataEntities,] = await Promise.all([this.getDashboardData(), this.getData()])

      this.renderDashboard(dataDashboard)

      if (this.tables.length && dataEntities) {
        this.actionsTables((table, i) => table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities))
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Finance