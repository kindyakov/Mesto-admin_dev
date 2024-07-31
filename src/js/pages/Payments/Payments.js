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
          }
        }
      ],
      page: 'payments'
    });
  }

  async getData(data = {}) {
    return getPayments(data)
  }
}

export default Payments