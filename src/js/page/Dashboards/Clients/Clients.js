import Dashboards from "../Dashboards.js";
import TableClients from "../../../components/Tables/TableClients/TableClients.js";
import { getClients, getDashboardClient } from "../../../settings/request.js";

class Clients extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-clients', TableComponent: TableClients, }
      ],
      page: 'clients'
    });
  }

  async getData(data = {}) {
    return getClients(data);
  }

  async getDashboardData() {
    return getDashboardClient();
  }
}

export default Clients