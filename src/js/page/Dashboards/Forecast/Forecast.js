import Dashboards from "../Dashboards.js";
import TableAgreements from "../../../components/Tables/TableAgreements/TableAgreements.js";
import TableTransactions from "../../../components/Tables/TableTransactions/TableTransactions.js";
import ChartConversions from "../../../components/Charts/ChartConversions/ChartConversions.js";
import { getAgreements } from "../../../settings/request.js";

class Forecast extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        { tableSelector: '.table-agreements', TableComponent: TableAgreements, },
        { tableSelector: '.table-transactions', TableComponent: TableTransactions, }
      ],
      charts: [
        { id: 'chart-conversions', ChartComponent: ChartConversions }
      ],
      page: 'forecast'
    });

  }

  async getData(data = {}) {
    return getAgreements(data)
  }

  async getDashboardData() {
    return []
  }
}

export default Forecast