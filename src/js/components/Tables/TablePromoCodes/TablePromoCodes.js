import Table from '../Table.js';

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { applyTableFilterMixin } from '../mixins/TableFilterMixin.js';

const TableWithFilters = applyTableFilterMixin(Table);

class TablePromoCodes extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Промокод',
          field: 'promocode',
          minWidth: 60,
          flex: 0.3,
        },
      ],
      pagination: false,
    };

    const defaultParams = { isPagination: false };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ promocodes = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.gridApi.setGridOption('rowData', promocodes);
  }
}

export default TablePromoCodes;
