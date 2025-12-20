import Page from "../Page.js"
import { getCells, getChangePrices } from "../../settings/request.js";
import TableCells from "../../components/Tables/TableCells/TableCells.js";
import TablePricesCells from "../../components/Tables/TablePricesCells/TablePricesCells.js";

class Cells extends Page {
  constructor({ loader, pageName }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-prices-cells',
          TableComponent: TablePricesCells,
          params: {
            getData: params =>
              getChangePrices({ warehouse_id: window.app.warehouse.warehouse_id, ...params })
          }
        },
        {
          tableSelector: '.table-cells',
          TableComponent: TableCells,
          options: {
            paginationPageSize: 1000
          },
          params: {
            getData: getCells
          }
        }
      ],
      page: pageName
    });

    const [tablePricesCells, tableCells] = this.tables;

    this.tablePricesCells = tablePricesCells;
    this.tableCells = tableCells;

    // Связываем таблицы для применения изменений диапазонов цен
    if (this.tablePricesCells) {
      this.tablePricesCells.onApplyChange = data => this.onApplyChange(data);
    }
  }

  onApplyChange(data) {
    // Логика применения изменений диапазонов цен к основной таблице
    // Можно реализовать по аналогии с Indexation.js если потребуется
    console.log('Price ranges applied:', data);
  }

  async getData(queryParams = {}) {
    return Promise.all([
      getChangePrices({ warehouse_id: window.app.warehouse.warehouse_id }),
      getCells({
        warehouse_id: window.app.warehouse.warehouse_id,
        ...queryParams
      })
    ]);
  }
}

export default Cells
