import Dashboards from "../Dashboards.js";
import TableSalesChannels from "../../../components/Tables/TableSalesChannels/TableSalesChannels.js";
import TableSalesChannelsEdit from "../../../components/Tables/TableSalesChannelsEdit/TableSalesChannelsEdit.js";
import ChartSalesChannels from "../../../components/Charts/ChartSalesChannels/ChartSalesChannels.js";

class SalesChannels extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-sales-channels', TableComponent: TableSalesChannels, },
        { tableSelector: '.table-sales-channels-edit', TableComponent: TableSalesChannelsEdit, }
      ],
      charts: [
        { id: 'chart-sales-channels', ChartComponent: ChartSalesChannels },
      ],
      page: 'sales-channels'
    });
  }

  async getData(data = {}) {
    return [];
  }

  async getDashboardData() {
    return []
  }
}

export default SalesChannels