import Table from '../Table.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';

class TableEmployee extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'ФИО', field: 'fullname', minWidth: 250, flex: 1, resizable: false,
        },
        { headerName: 'Дата', field: 'date', minWidth: 80, flex: 0.5, resizable: false, valueFormatter: params => getFormattedDate(params.value) },
        { headerName: 'Время начала рабочего дня', field: 'time_start', minWidth: 100, flex: 0.6, resizable: false, },
        { headerName: 'Время окончания рабочего дня', field: 'time_end', minWidth: 100, flex: 0.6, resizable: false, },
        {
          headerName: 'Фотоотчет', field: '', minWidth: 100, flex: 0.5, resizable: false, sortable: false,
          cellRenderer: params => {
            const div = createElement('div', [], `
              </img src="${params.data.start_photo_link}" alt="Картинка">
              </img src="${params.data.end_photo_link}" alt="Картинка">`)
            return div
          }
        },
      ],
    };

    const defaultParams = {
    }

    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);

  }
  render(data) {
    return
    const { clients, cnt_pages, page } = data
    this.setPage(page, cnt_pages)

    this.gridApi.setGridOption('rowData', clients)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, clients.length])
  }
}

export default TableEmployee