import Dashboards from "../Dashboards.js";
import TableAgreements from "../../../components/Tables/TableAgreements/TableAgreements.js";
import TableTransactions from "../../../components/Tables/TableTransactions/TableTransactions.js";
import ChartConversions from "../../../components/Charts/ChartConversions/ChartConversions.js";
import { getSales, getSaleChannels, getAgreements, getSalesConversionRates } from "../../../settings/request.js";
import { dateFormatter, subtractMonths } from "../../../settings/dateFormatter.js";

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

    this.tables[0].onReadyFunctions.push(function name(context) {
      context.calendar.setDate([subtractMonths(new Date(), 2), new Date()])
    })
  }

  async getData(queryParams = {}) {
    return Promise.all([
      [
        await getSales({
          show_cnt: this.tables[0].gridOptions.paginationPageSize,
          start_date: dateFormatter(this.subtractMonths(new Date(), 2), 'yyyy-MM-dd'),
          end_date: dateFormatter(new Date(), 'yyyy-MM-dd'),
          ...queryParams
        }),
        await getSaleChannels()
      ],
      getAgreements({ show_cnt: this.tables[1].gridOptions.paginationPageSize, ...queryParams })
    ])
  }

  async getDashboardData(queryParams = {}) {
    return getSalesConversionRates(queryParams)
  }
}

export default Transactions