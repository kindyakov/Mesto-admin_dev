import Table from '../Table.js';
import { createElement } from '../../../settings/createElement.js'
import { getBatteryImage } from '../../../pages/ChargingLocks/html.js';

class TableLocks extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Номер ячейки', field: 'room_id', width: 120, resizable: false,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = `№${params.value || ''}`
            return span
          }
        },
        {
          headerName: 'Заряд', field: 'electric_quantity', width: 100, flex: 1, resizable: false,
          cellRenderer: params => {
            const div = createElement('div', {
              content: `
              <span>${params.value ? params.value + '%' : ''}</span>
              <img src="./img/icons/${getBatteryImage(params.value)}" alt="иконка">`
            })
            div.style.cssText = `display: flex; align-items: center; gap: 10px; color: #212b36; font-weight: 400; font-size: 14px;`
            return div
          }
        },
        {
          headerName: '', width: 120, resizable: false, sortable: false,
          cellRenderer: params => {
            const button = createElement('button', { classes: ['table-button', 'transparent'], content: `<span>Открыть</span>` })
            button.setAttribute('data-json', JSON.stringify(params.data))
            button.setAttribute('data-modal', 'modal-confirm-open-room')
            return button
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

  onRendering({ rooms_x_locks = [], cnt_pages, page, cnt_all = 0 }) {
    this.cntAll = cnt_all
    this.setPage(page, cnt_pages)
    this.gridApi?.setGridOption('rowData', rooms_x_locks)
    // this.gridApi?.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, rooms_x_locks.length])
  }
}

export default TableLocks