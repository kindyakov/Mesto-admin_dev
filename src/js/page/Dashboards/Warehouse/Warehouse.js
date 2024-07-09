import Dashboards from "../Dashboards.js";
import TableAgreements from "../../../components/Tables/TableAgreements/TableAgreements.js";
import TableTransactions from "../../../components/Tables/TableTransactions/TableTransactions.js";
import { getAgreements } from "../../../settings/request.js";

class Warehouse extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-agreements', TableComponent: TableAgreements, },
        { tableSelector: '.table-transactions', TableComponent: TableTransactions, }
      ],
      page: 'warehouse'
    });

  }

  async getData(data = {}) {
    return getAgreements(data)
  }

  async getDashboardData() {
    return []
  }
}

export default Warehouse