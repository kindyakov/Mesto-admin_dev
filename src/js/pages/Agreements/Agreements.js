import Page from "../Page.js"
import TableAgreements from "../../components/Tables/TableAgreements/TableAgreements.js";
import { getAgreements } from "../../settings/request.js";

class Agreements extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-agreements',
          TableComponent: TableAgreements,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getAgreements
          }
        }
      ],
      page: 'agreements'
    });
  }

  async getData(queryParams = {}) {
    return getAgreements({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams })
  }
}

export default Agreements