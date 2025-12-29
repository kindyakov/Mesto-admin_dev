import Page from "../Page.js"
import TableLocks from "../../components/Tables/TableLocks/TableLocks.js";
import { createElement } from "../../settings/createElement.js";
import { getLocks } from "../../settings/request.js";

class Locks extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-locks',
          TableComponent: TableLocks,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: getLocks
          }
        }
      ],
      page: 'locks'
    });
  }

  async getData(queryParams = {}) {
    return getLocks()
  }

  onRender(data) {

  }
}

export default Locks