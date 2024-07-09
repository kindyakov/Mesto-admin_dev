import Dashboards from "../Dashboards.js";
import { api } from "../../../settings/api.js";
import TablePayments from "../../../components/Tables/TablePayments/TablePayments.js"
import { getDashboardFinance, getPayments } from "../../../settings/request.js";

class Finance extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-payments', TableComponent: TablePayments, }
      ],
      page: 'finance'
    });
  }

  async getData(data = {}) {
    return getPayments(data);
  }

  async getDashboardData(data = {}) {
    return getDashboardFinance(data);
  }
}

export default Finance