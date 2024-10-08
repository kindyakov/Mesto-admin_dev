import Page from "../Page.js";
import TableClients from "../../components/Tables/TableClients/TableClients.js";
import { getClients } from "../../settings/request.js";

class ListClients extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-clients',
          TableComponent: TableClients,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getClients,
          }
        }
      ],
      page: 'list-clients'
    });
  }

  async getData(queryParams = {}) {
    return getClients({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams });
  }
}

export default ListClients