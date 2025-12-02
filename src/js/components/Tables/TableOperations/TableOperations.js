import Table from '../Table.js';
import { actions } from '../utils/actions.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

class TableOperations extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerCheckboxSelection: true,
          checkboxSelection: true,
          width: 50,
          resizable: false,
          sortable: false
        },
        {
          headerName: 'Дата',
          field: 'operation_date',
          minWidth: 90,
          flex: 0.3,
          valueFormatter: params => dateFormatter(params.value)
        },
        {
          headerName: 'Склад',
          field: 'warehouse_id',
          minWidth: 80,
          flex: 0.1,
          valueFormatter: params => {
            let warehouse_name = '';
            this.app.warehouses.find(warehouse => {
              if (warehouse.warehouse_id === params.value) {
                warehouse_name = warehouse.warehouse_short_name;
                return true;
              }
            })
            return warehouse_name
          }
        },
        {
          headerName: 'Категория',
          field: 'category',
          minWidth: 100,
          flex: 0.5,
        },
        {
          headerName: 'Подкатегория',
          field: 'subcategory',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Сумма платежа (₽)',
          field: 'amount',
          minWidth: 100,
          flex: 0.3,
          valueFormatter: params => formattingPrice(params.value)
        },
        {
          headerName: 'Комментарий',
          field: 'comment',
          minWidth: 100,
          flex: 0.3,
        },
        {
          headerName: 'Действия',
          field: 'actions',
          width: 90,
          resizable: false,
          sortable: false
        }
      ]
    };

    const defaultParams = {
      selectTypeUser: true,
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);

    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ operations = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all;
    this.pagination.setPage(page, cnt_pages, cnt_all);
    this.gridApi.setGridOption('rowData', operations);
  }
}

export default TableOperations;
