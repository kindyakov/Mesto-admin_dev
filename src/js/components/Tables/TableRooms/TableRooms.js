import Table from '../Table.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
// import { addPrefixToNumbers } from '../utils/addPrefixToNumbers.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { createElement } from '../../../settings/createElement.js';
import { observeCell } from '../utils/observeCell.js';

function typeRoom(rented) {
	const text = {
		0: 'Свободно',
		0.25: 'Гостевые',
		0.4: 'Не оплачено',
		0.5: 'Забронировано',
		0.75: 'Выезд',
		1: 'Занято'
	};

	return text[rented] ? text[rented] : '';
}

function dataStr(data) {
	return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;');
}

function buttonsRoom(data) {
	const buttons = {
		0: `<button class="table-button button" data-modal="modal-get-guest-access" data-json="${dataStr(data)}"><span>Гостевой доступ</span></button>`,
		0.25: `<button class="table-button button" data-modal="modal-confirm-cancel-guest-access" data-json="${dataStr(data)}"><span>Отменить доступ</span></button>`,
		0.4: `<button class="table-button button" data-modal="modal-confirm-cancel-payment" data-json="${dataStr(data)}"><span>Отменить оплату</span></button>`,
		0.5: `<button class="table-button button" data-modal="modal-passport" user-id="${data.user_id}"><span>Подтвердить клиента</span></button>`,
		0.75: `<button class="table-button button ${data.leave_approved ? '_confirmed' : ''}" data-modal="modal-confirmation-departure" room-id="${data.room_id}" agr-id="${data.agrid}">
      <span>Подтвердить выезд</span>
      <span>Выезд Подтвержден</span>
    </button>`,
		1: `<button class="table-button button" data-modal="modal-agreement" agr-id="${data.agrid || ''}"><span>Открыть договор</span></button>`
	};

	return buttons[data.rented] ? buttons[data.rented] : '';
}

class TableRooms extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				{
					headerName: 'Ячейка',
					field: 'room_id',
					minWidth: 80,
					flex: 0.3,
					cellRenderer: params => {
						const span = document.createElement('span');
						span.classList.add('table-span-agrid');
						span.textContent = params.value ? '№' + params.value : '___';
						return span;
					}
				},
				{
					headerName: 'Клиент',
					field: 'fullname',
					minWidth: 300,
					flex: 1,
					cellRenderer: params => {
						const el = createElement('p', {
							classes: ['table-p'],
							content: `
              <svg class='icon icon-profile'>
                <use xlink:href='img/svg/sprite.svg#profile'></use>
              </svg>
              <span>${params.value ? params.value : '___'}</span>`
						});
						observeCell(el, params);
						return el;
					}
				},
				{
					headerName: 'Этаж',
					field: 'floor',
					minWidth: 50,
					flex: 0.3
				},
				{
					headerName: 'Площадь',
					field: 'area',
					minWidth: 80,
					flex: 0.4,
					valueFormatter: params => (params.value ? params.value + ' м²' : '___')
				},
				{
					headerName: 'Цена',
					field: 'price',
					minWidth: 120,
					flex: 0.3,
					cellRenderer: params => {
						const span = document.createElement('span');
						span.classList.add('table-span-price');
						span.innerHTML = params.value ? formattingPrice(params.value) : 'нет';
						return span;
					}
				},
				{
					headerName: 'Статус',
					field: 'rented',
					minWidth: 140,
					flex: 0.3,
					cellRenderer: params => {
						const span = document.createElement('span');
						span.classList.add('table-span-agrid');
						span.textContent = typeRoom(params.value);
						return span;
					}
				},
				{
					headerName: 'Дата след. оплаты',
					field: 'next_payment_date',
					minWidth: 100,
					flex: 0.5,
					valueFormatter: params => (params.value ? getFormattedDate(params.value) : '___')
				},
				{
					headerName: 'Дата выезда',
					field: '',
					minWidth: 100,
					flex: 0.4,
					valueFormatter: params => (params.value ? getFormattedDate(params.value) : '___')
				},
				{
					headerName: '',
					field: '',
					minWidth: 300,
					flex: 1,
					sortable: false,
					resizable: false,
					cellRenderer: params => {
						const div = createElement('div', {
							classes: ['table-buttons'],
							content: `${buttonsRoom(params.data)}
            ${
							+params.data.rented === 0.75
								? `<button class="table-button button transparent" data-modal="modal-complete-rent" agr-id="${params.data.agrid || ''}" room-id="${params.data.room_id || ''}">
                      <span>Ускорить</span>
                    </button>`
								: `<button class="table-button button transparent" data-modal="modal-confirm-open-room" data-json="${dataStr(params.data)}"><span>Открыть</span></button>`
						}`
						});
						return div;
					}
				}
			]
		};
		const defaultParams = {};
		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);
		this.queryParams = { ...this.queryParams, warehouse_id: this.app.warehouse.warehouse_id };
	}

	onRendering({ rooms = [], cnt_pages = 0, page = 0, cnt_all = 0 }) {
		this.cntAll = cnt_all;
		this.pagination.setPage(page, cnt_pages, cnt_all);
		this.gridApi.setGridOption('rowData', rooms);
		this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, rooms.length]);
	}
}

export default TableRooms;
