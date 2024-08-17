import Dashboards from "../Dashboards.js";
import TableSalesChannels from "../../../components/Tables/TableSalesChannels/TableSalesChannels.js";
import TableSalesChannelsEdit from "../../../components/Tables/TableSalesChannelsEdit/TableSalesChannelsEdit.js";
import ChartSalesChannels from "../../../components/Charts/ChartSalesChannels/ChartSalesChannels.js";
import { getSaleChannelsExpenses, getSaleChannelsStats } from "../../../settings/request.js";

class SalesChannels extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-sales-channels-edit',
          TableComponent: TableSalesChannelsEdit,
          params: {
            getData: getSaleChannelsExpenses,
          }
        },
        {
          tableSelector: '.table-sales-channels',
          TableComponent: TableSalesChannels,
          params: {
            getData: getSaleChannelsStats,
          }
        },
      ],
      charts: [
        { id: 'chart-sales-channels', ChartComponent: ChartSalesChannels },
      ],
      page: 'dashboards/sales-channels'
    });
  }

  async getData(queryParams = {}) {
    return Promise.all([getSaleChannelsExpenses(queryParams), getSaleChannelsStats(queryParams)]);
  }

  async getDashboardData() {
    return []
  }
}

export default SalesChannels