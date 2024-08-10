import Table from "../Table.js";

import { formattingPrice } from '../../../utils/formattingPrice.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { getFormattedDate } from "../../../utils/getFormattedDate.js";

class TableUpcomingPayments extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        // { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
        {
          headerName: 'Дата платежа', field: 'write_off_date', minWidth: 140, flex: 0.5,
          cellRenderer: params => cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
        },
        {
          headerName: 'Сумма', field: 'price', minWidth: 80, flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 350, flex: 1,
          cellRenderer: params => cellRendererInput(params, { iconId: 'profile' })
        },
        {
          headerName: 'Договор', field: 'agrid', minWidth: 70, flex: 0.5,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = params.value ? addPrefixToNumbers(params.value) : 'нет'
            return cellRendererInput(params, { el: span })
          }
        },
        {
          headerName: 'Вид поступления', field: 'type', minWidth: 90, flex: 0.5,
        },
        {
          headerName: 'Физ./Юр.', field: 'user_type', minWidth: 90, flex: 0.5, resizable: false,
          valueFormatter: params => params.value === 'f' ? 'Физ. лицо' : 'Юр. лицо'
        },
      ],
    };

    const defaultParams = {}

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  onRendering({ agreements = [], cnt_pages, page }) {
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', agreements)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, agreements.length])
  }
}

export default TableUpcomingPayments