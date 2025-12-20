import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableCells extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Ячейка',
          field: 'room_name',
          minWidth: 80,
          flex: 0.3,
        }
      ]
    };

    const defaultParams = {
      onChangeTypeUser: () => { }
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);

  }

  onRendering({ cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.pagination.setPage(page, cnt_pages, cnt_all);
    // this.gridApi.setGridOption('rowData', );
  }
}

export default TableCells;
