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
          }
        }
      ],
      page: 'forecast'
    });
  }

  async getData(data = {}) {
    return getClients(data);
  }
}

export default ListClients