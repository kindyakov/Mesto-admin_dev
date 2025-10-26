import Dashboards from '../Dashboards.js';
import TableUpcomingPayments from '../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js';
import ChartSales from '../../../components/Charts/ChartSales.js';
import {
  getDashboardFinance,
  getFinancePlan,
  postFuturePayments
} from '../../../settings/request.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { mergeQueryParams } from '../../../utils/buildQueryParams.js';
import { getPreviousMonthsRanges } from '../../../utils/getPreviousMonthsRanges.js';

class Business extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-payments-business',
          TableComponent: TableUpcomingPayments,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: postFuturePayments
          }
        }
      ],
      charts: [
        { id: 'chart-sales', ChartComponent: ChartSales },
      ],
      page: 'dashboards/business'
    });

    this.actionsCharts(chart => {
      chart.loader = this.loader;
      chart.app = this.app;
      chart.queryParams = this.queryParams;
    });
  }

  async getData(queryParams = {}) {
    this.table.queryParams = mergeQueryParams(this.table.queryParams, queryParams)
    return postFuturePayments({
      warehouse_id: this.app.warehouse.warehouse_id,
      show_cnt: 1000,
      show_what: this.table?.queryParams?.show_what || 'reestr',
      ...queryParams
    });
  }

  async getDashboardData(queryParams = {}) {
    return Promise.all([
      getDashboardFinance({
        warehouse_id: this.app.warehouse.warehouse_id,
        ...this.queryParams,
        ...queryParams
      }),
      getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams }),
    ]);
  }

  onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
    if (finance_planfact) {
      const today = new Date().toISOString().split('T')[0];
      const startDate = new Date(this.queryParams.start_date);
      const endDate = new Date(this.queryParams.end_date);
      const currentDate = new Date(today);

      let data = finance_planfact[finance_planfact.at(-1)]

      if (currentDate >= startDate && currentDate <= endDate) {
        data = finance_planfact.find(item => item.data === today)
      }

      this.renderWidgets(data);
    }

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => {
        table.data = dataEntities.agreements;
        table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities);
      });
    }
  }
}

export default Business;
