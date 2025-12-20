import Page from "../Page.js"
import TablePromoCodes from "../../components/Tables/TablePromoCodes/TablePromoCodes.js";
import { getPromoCodes } from "../../settings/request.js";

class PromoCodes extends Page {
  constructor({ loader, pageName }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-promo-codes',
          TableComponent: TablePromoCodes,
          options: {
            paginationPageSize: 15
          },
          params: {
            getData: getPromoCodes
          }
        }
      ],
      page: pageName
    });
  }

  async getData(queryParams = {}) {
    return getPromoCodes(queryParams)
  }
}

export default PromoCodes