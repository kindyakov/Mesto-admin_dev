import Dashboards from '../Dashboards.js';
import TableUpcomingPayments from '../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js';
import ChartSales from '../../../components/Charts/ChartSales.js';
import ChartSalesArea from '../../../components/Charts/ChartSalesArea.js';
import ChartLeads from '../../../components/Charts/ChartLeads.js';
import {
  getDashboardFinance,
  getFinancePlan,
  postFuturePayments
} from '../../../settings/request.js';
import { mergeQueryParams } from '../../../utils/buildQueryParams.js';

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
        { id: 'chart-sales-area', ChartComponent: ChartSalesArea },
        { id: 'chart-leads', ChartComponent: ChartLeads },
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
    const currentWarehouseId = this.app.warehouse.warehouse_id;

    if (currentWarehouseId === 0) {
      const [dashboard, ...plans] = await Promise.all([
        getDashboardFinance({ warehouse_id: 0, ...this.queryParams, ...queryParams }),
        ...this.app.warehouses.map(w =>
          getFinancePlan({ warehouse_id: w.warehouse_id, ...queryParams })
        )
      ]);

      // Связываем планы со складами
      const plansWithWarehouseIds = plans.map((plan, index) => ({
        warehouse_id: this.app.warehouses[index].warehouse_id,
        warehouse_short_name: this.app.warehouses[index].warehouse_short_name || '',
        ...plan // разворачиваем данные плана
      }));

      // Возвращаем ПЛОСКИЙ массив, как было раньше
      return [dashboard, ...plansWithWarehouseIds];
    }

    return Promise.all([
      getDashboardFinance({ warehouse_id: currentWarehouseId, ...this.queryParams, ...queryParams }),
      getFinancePlan({ warehouse_id: currentWarehouseId, ...queryParams })
    ]);
  }

  onHandleScrollTo({ params }) {
    const [table] = this.tables;
    if (!params) return;
    const today = new Date().toISOString().split('T')[0];

    params = JSON.parse(params);
    params.warehouse_id = window.app.warehouse.warehouse_id

    if (params.show_what) {
      table.selects.setValue(params.show_what)
    }

    if (params.start_date === 'today') {
      params.start_date = today
    }

    if (params.end_date === 'today') {
      params.end_date = today
    }

    if (params.start_date === '') {
      params.start_date = this.queryParams.start_date
    }

    if (params.end_date === '') {
      params.end_date = this.queryParams.end_date
    }

    table.updateQueryParams(params, false);
  }

  onRender([dataDashboard, ...data], dataEntities) {
    const { finance_planfact } = data.length > 1 ? data.find(obj => obj.warehouse_id === 0) : data[0]

    let todayFinancePlanFact = {}
    if (finance_planfact) {
      const today = new Date().toISOString().split('T')[0];
      const startDate = new Date(this.queryParams.start_date);
      const endDate = new Date(this.queryParams.end_date);
      const currentDate = new Date(today);

      todayFinancePlanFact = finance_planfact.at(-1)

      if (currentDate >= startDate && currentDate <= endDate) {
        todayFinancePlanFact = finance_planfact.find(item => item.data === today)
      }
    }


    this.renderWidgets({ ...dataDashboard, ...todayFinancePlanFact });

    if (this.tables.length && dataEntities) {
      this.actionsTables((table, i) => {
        table.data = dataEntities.agreements;
        table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities);
        table.queryParams = {
          ...table.queryParams, end_date: this.queryParams.end_date, start_date: this.queryParams.start_date
        }
      });
    }

    if (data.length > 1) {
      this.actionsCharts(chart => {
        chart.moreFinances = data.filter(obj => obj.warehouse_id !== 0)
      });
    }
  }
}

export default Business;
