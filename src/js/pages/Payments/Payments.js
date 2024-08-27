import Page from "../Page.js"
import TablePayments from '../../components/Tables/TablePayments/TablePayments.js'
import { getPayments } from "../../settings/request.js";

class Payments extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-payments',
          TableComponent: TablePayments,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getPayments
          }
        }
      ],
      page: 'payments'
    });
  }

  async getData(queryParams = {}) {
    return getPayments({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams })
  }
}

export default Payments