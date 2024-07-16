import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';

function typeRoom(rented) {
  const text = {
    0: 'Свободно',
    0.25: 'Гостевые',
    0.4: 'Не оплачено',
    0.5: 'Забронировано',
    0.75: 'Выезд',
    1: 'Занято',
  }

  return text[rented] ? text[rented] : ''
}

function dataStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
}

function buttonsRoom(data) {
  const buttons = {
    0: `<button class="table-button button" data-modal="modal-get-guest-access" data-json="${dataStr(data)}"><span>Гостевой доступ</span></button>`,
    0.25: `<button class="table-button button" data-modal="" data-json="${dataStr(data)}"><span>Отменить доступ</span></button>`,
    0.4: `<button class="table-button button" data-modal="" data-json="${dataStr(data)}"><span>Отменить оплату</span></button>`,
    0.5: `<button class="table-button button" data-modal="modal-confirmation-client" data-json="${dataStr(data)}"><span>Подтвердить</span></button>`,
    0.75: `<button class="table-button button" data-modal="modal-confirmation-departure" data-json="${dataStr(data)}"><span>Подтвердить</span></button>`,
    1: `<button class="table-button button" data-modal="modal-agreement" data-json="${dataStr(data)}"><span>Открыть договор</span></button>`,
  }

  return buttons[data.rented] ? buttons[data.rented] : ''
}

class TableRooms extends Table {
  constructor(selector, options, params) {
    const defaultOptions = {
      columnDefs: [
        {
          headerName: 'Ячейка', field: 'room_id', flex: 0.3,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = params.value ? '№' + params.value : '___'
            return span
          }
        },
        {
          headerName: 'Клиент', field: 'fullname', flex: 1,
          cellRenderer: params => {
            const span = createElement('p', ['table-p'], `
              <svg class='icon icon-profile'>
                <use xlink:href='img/svg/sprite.svg#profile'></use>
              </svg>
              <span>${params.value ? params.value : '___'}</span>`)
            return span
          }
        },
        {
          headerName: 'Этаж', field: 'floor', flex: 0.3,
        },
        {
          headerName: 'Площадь', field: 'area', flex: 0.4,
          valueFormatter: params => params.value ? params.value + ' м²' : '___'
        },
        {
          headerName: 'Цена', field: 'price', flex: 0.4,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-price')
            span.innerHTML = params.value ? formattingPrice(params.value) : 'нет'
            return span
          }
        },
        {
          headerName: 'Статус', field: 'rented', flex: 0.3,
          cellRenderer: params => {
            const span = document.createElement('span')
            span.classList.add('table-span-agrid')
            span.textContent = typeRoom(params.value)
            return span
          }
        },
        {
          headerName: 'Дата след. оплаты', field: 'next_payment_date', flex: 0.5,
          valueFormatter: params => params.value ? getFormattedDate(params.value) : '___'
        },
        {
          headerName: 'Дата выезда', field: '', flex: 0.4,
          valueFormatter: params => params.value ? getFormattedDate(params.value) : '___'
        },
        {
          headerName: '', field: '', flex: 1, sortable: false, resizable: false,
          cellRenderer: params => {
            const div = createElement('div', ['table-buttons'], `${buttonsRoom(params.data)}
            ${+params.data.rented === 0.75
                ? `<button class="table-button button transparent" data-modal="" data-json="${dataStr(params.data)}"><span>Ускорить</span></button>`
                : `<button class="table-button button transparent" data-modal="modal-confirm-open-room" data-json="${dataStr(params.data)}"><span>Открыть</span></button>`}`)
            return div
          }
        }
      ],
    };
    const defaultParams = {
    }
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const mergedParams = Object.assign({}, defaultParams, params);
    super(selector, mergedOptions, mergedParams);
  }

  render(data) {
    const { rooms, cnt_pages, page } = data;
    this.setPage(page, cnt_pages)
    this.gridApi.setGridOption('rowData', rooms)
    this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, rooms.length])
  }
}

export default TableRooms