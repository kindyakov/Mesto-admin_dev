import Page from "../Page.js"
import TableOperations from "../../components/Tables/TableOperations/TableOperations.js"
import { getOperations } from "../../settings/request.js"
import { dateFormatter } from "../../settings/dateFormatter.js"

class Budgeting extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-operations',
          TableComponent: TableOperations,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: getOperations
          }
        }
      ],
      page: 'budgeting'
    });
  }

  init(page) {
    super.init(page);

    if (this.tables[0]) {
      window.app.modalMap['modal-operations'] = this.tables[0];
    }
  }

  async getData(queryParams = {}) {
    // Если фильтры по датам не заданы, устанавливаем предыдущий месяц
    if (!queryParams.filter_start_date || !queryParams.filter_end_date) {
      const now = new Date();
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      queryParams = {
        filter_start_date: dateFormatter(firstDayPrevMonth, 'yyyy-MM-dd'),
        filter_end_date: dateFormatter(lastDayPrevMonth, 'yyyy-MM-dd'),
        ...queryParams
      };
    }

    return getOperations({
      show_cnt: this.tables[0].gridOptions.paginationPageSize,
      ...queryParams
    })
  }
}

export default Budgeting