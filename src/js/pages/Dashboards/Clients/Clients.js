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
      page: 'clients'
    });
  }

  async getData(data = {}) {
    return getClients(data);
  }

  async getDashboardData(data = {}) {
    return getDashboardClient(data);
  }
}

export default Clients