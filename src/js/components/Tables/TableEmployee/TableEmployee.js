import Table from '../Table.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';

class TableEmployee extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'ФИО', field: 'manager_fullname', minWidth: 250, flex: 1, resizable: false,
        },
        { headerName: 'Дата', field: 'date', minWidth: 80, flex: 0.5, resizable: false, valueFormatter: params => getFormattedDate(params.value) },
        { headerName: 'Время начала рабочего дня', field: 'time_start', minWidth: 100, flex: 0.6, resizable: false, },
        { headerName: 'Время окончания рабочего дня', field: 'time_end', minWidth: 100, flex: 0.6, resizable: false, },
        {
          headerName: 'Фотоотчет', field: '', minWidth: 100, flex: 0.5, resizable: false, sortable: false,
          cellRenderer: params => {
            const div = createElement('div', {
              classes: ['wrap-photo-report'], content: `
              <div data-src="${params.data.start_photo_link}" data-fancybox="table-employee" data-caption="Фото начало рабочего дня </br>Время: ${params.data.time_start}</br>Сотрудник: ${params.data.manager_fullname}">
                <img src="${params.data.start_photo_link}"/>
              </div>
              ${params.data.end_photo_link ? `
              <div data-src="${params.data.end_photo_link}" data-fancybox="table-employee" data-caption="Фото завершения рабочего дня </br>Время: ${params.data.time_end}</br>Сотрудник: ${params.data.manager_fullname}">
                <img src="${params.data.end_photo_link}"/>
              </div>`: ''}`
            })
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
  onRendering({ timepoints = [], cnt_pages, page }) {
    // this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', timepoints)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, timepoints.length])
  }
}

export default TableEmployee