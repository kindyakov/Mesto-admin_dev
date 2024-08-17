import Dashboards from "../Dashboards.js";
import TableAgreements from "../../../components/Tables/TableAgreements/TableAgreements.js";
import TableTransactions from "../../../components/Tables/TableTransactions/TableTransactions.js";
import ChartConversions from "../../../components/Charts/ChartConversions/ChartConversions.js";
import { getSales, getSaleChannels, getAgreements, getSalesConversionRates } from "../../../settings/request.js";

class Transactions extends Dashboards {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-transactions',
          TableComponent: TableTransactions,
          params: {
            getData: async function (queryParams = {}) {
              try {
                return await Promise.all([getSales(queryParams), getSaleChannels()])
              } catch (error) {
                console.error(error)
                throw error
              }
            },
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
    return Promise.all([[await getSales(queryParams), await getSaleChannels()], getAgreements(queryParams)])
  }

  async getDashboardData(queryParams = {}) {
    return getSalesConversionRates(queryParams)
  }
}

export default Transactions