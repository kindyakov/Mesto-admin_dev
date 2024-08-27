import Dashboards from "../Dashboards.js";
import TableClients from "../../../components/Tables/TableClients/TableClients.js";
import ChartInfluxCustomers from "../../../components/Charts/ChartInfluxCustomers/ChartInfluxCustomers.js";
import ChartGenderAge from "../../../components/Charts/СhartGenderAge/СhartGenderAge.js";
import { getClients, getDashboardClient } from "../../../settings/request.js";

class Clients extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-clients', TableComponent: TableClients, params: { getData: getClients } }
      ],
      charts: [
        { id: 'chart-influx-customers', ChartComponent: ChartInfluxCustomers },
        { id: 'chart-gender-age', ChartComponent: ChartGenderAge },
      ],
      page: 'dashboards/clients'
    });
  }

  async getData(queryParams = {}) {
    return getClients({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams });
  }

  async getDashboardData(queryParams = {}) {
    return getDashboardClient(queryParams)
  }
}

export default Clients