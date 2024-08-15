import Dashboards from "../Dashboards.js";
import TableAgreements from "../../../components/Tables/TableAgreements/TableAgreements.js";
import TableTransactions from "../../../components/Tables/TableTransactions/TableTransactions.js";
import ChartConversions from "../../../components/Charts/ChartConversions/ChartConversions.js";
import { getAgreements, getSales } from "../../../settings/request.js";

class Transactions extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-transactions',
          TableComponent: TableTransactions,
          params: {
            getData: getSales,
          }
        },
        {
          tableSelector: '.table-agreements',
          TableComponent: TableAgreements,
          params: {
            getData: getAgreements,
          }
        },
      ],
      charts: [
        { id: 'chart-conversions', ChartComponent: ChartConversions }
      ],
      page: 'dashboards/transactions'
    });

  }

  async getData(queryParams = {}) {
    return Promise.all([getSales(queryParams), getAgreements(queryParams)])
  }

  async getDashboardData() {
    return []
  }
}

export default Transactions