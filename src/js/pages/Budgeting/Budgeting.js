import Page from "../Page.js"
import TableOperations from "../../components/Tables/TableOperations/TableOperations.js"
import { getOperations } from "../../settings/request.js"

class Budgeting extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-operations',
          TableComponent: TableOperations,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getOperations
          }
        }
      ],
      page: 'budgeting'
    });
  }

  async getData(queryParams = {}) {
    return getOperations({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams })
  }
}

export default Budgeting