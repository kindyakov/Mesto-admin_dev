import Page from "../Page.js"
import { getCells } from "../../settings/request.js";
import TableCells from "../../components/Tables/TableCells/TableCells.js";

class Cells extends Page {
  constructor({ loader, pageName }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-cells',
          TableComponent: TableCells,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getCells
          }
        }
      ],
      page: pageName
    });
  }

  async getData(queryParams = {}) {
    return getCells(queryParams);
  }
}

export default Cells