import Table from '../Table.js';

import { actions } from '../utils/actions.js';
import { cellRendererSelect } from '../utils/cellRenderer.js';

import { api } from '../../../settings/api.js';
import { createElement } from '../../../settings/createElement.js';
import { getFormattedDate } from '../../../utils/getFormattedDate.js';
import { formatPhoneNumber } from '../../../utils/formattingPrice.js';
// import { buildQueryParams } from '../../../utils/buildQueryParams.js';
import { observeCell } from '../utils/observeCell.js';

// function subtractMonths(date, months) {
//   const newDate = new Date(date);
//   newDate.setMonth(newDate.getMonth() - months);

//   return newDate;
// }

function moveChannelToFront(arr, id) {
	const index = arr.findIndex(item => item.channel_id === id);

	if (index !== -1) {
		const [element] = arr.splice(index, 1);
		arr.unshift(element);
	}

	return arr;
}

function addClassSpan(value) {
	let strClass = '';

	switch (value) {
		case 'Не обработан':
			strClass = 'yellow';
			break;
		case 'В процессе':
			strClass = 'blue';
			break;
		case 'Отказ':
			strClass = 'red';
			break;
		case 'Сделка':
			strClass = 'green';
			break;
	}

	return strClass;
}

class TableTransactions extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				// { headerCheckboxSelection: true, checkboxSelection: true, width: 50, resizable: false, sortable: false, },
				{
					headerName: 'Время сделки',
					field: 'question_datetime',
					minWidth: 160,
					flex: 0.6,
					valueFormatter: params => {
						let value = 'нет';
						if (params.value) {
							const [date, time] = params.value.split(' ');
							value = `${getFormattedDate(date)} ${time ? time : '00:00:00'}`;
						}
						return value;
					}
				},
				{
					headerName: 'Телефон',
					field: 'username',
					minWidth: 150,
					flex: 0.6,
					valueFormatter: params => (params.value ? formatPhoneNumber(params.value) : 'нет')
				},
				{
					headerName: 'ФИО',
					field: 'fullname',
					minWidth: 250,
					flex: 1,
					cellRenderer: params => {
						const wp = createElement('div', {
							classes: ['table-open-modal'],
							content: params.value
						});
						observeCell(wp, params);
						return wp;
					}
				},
				{
					headerName: 'Источник',
					field: 'source',
					minWidth: 130,
					flex: 0.5
				},
				{
					headerName: 'Канал продаж',
					field: 'sale_channel',
					minWidth: 180,
					flex: 0.8,
					cellRenderer: params => {
						const { sale_channels, channel_id } = params.data;
						if (!sale_channels.length) return '';
						const options = moveChannelToFront(sale_channels, channel_id).map(
							obj => obj.sale_channel_name
						);
						params.value = options[0];
						params.setValue(params.value);
						params.data.channel_id = sale_channels[0].channel_id;
						const span = createElement('span', {
							classes: ['table-span-w', 'gray'],
							content: params.value
						});
						this.addHandleDbClickCell(params);
						return cellRendererSelect(params, {
							el: span,
							options,
							onSelect: value => {
								const [filterChannel] = sale_channels.filter(
									channel => channel.sale_channel_name == value
								);
								params.data.channel_id = filterChannel.channel_id;
							}
						});
					}
				},
				{
					headerName: 'Дата сделки',
					field: 'agrbegdate',
					minWidth: 180,
					flex: 0.5,
					cellRenderer: params => getFormattedDate(params.value) // cellRendererInput(params, { funcFormate: getFormattedDate, iconId: 'calendar' })
				},
				{
					headerName: 'Статус',
					field: 'status',
					minWidth: 200,
					flex: 0.8,
					cellRenderer: params => {
						let options = [params.value, 'Не обработан', 'В процессе', 'Отказ', 'Сделка'];
						options = [...new Set(options.filter(item => item !== null))];
						params.setValue(options[0]);
						params.value = options[0];
						const span = createElement('span', {
							classes: ['table-span-w', addClassSpan(params.value)],
							content: params.value
						});
						this.addHandleDbClickCell(params);
						return cellRendererSelect(params, {
							el: span,
							options,
							onSelect: value => {
								span.classList.remove('yellow', 'blue', 'red', 'green');
								span.classList.add(addClassSpan(value));
							}
						});
					}
				},
				{
					headerName: 'Действия',
					field: 'actions',
					width: 90,
					resizable: false,
					sortable: false,
					cellRenderer: params => this.actionCellRenderer(params)
				}
			]
		};

		const defaultParams = {
			selectTypeUser: true
		};

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		// this.actionCellRenderer = this.actionCellRenderer.bind(this)
		// this.enableEditing = this.enableEditing.bind(this)
	}

	actionCellRenderer(params) {
		const row = params.eGridCell.closest('.ag-row');
		const button = createElement('button', {
			classes: ['button-table-actions'],
			content: `<span></span><span></span><span></span><svg class='icon icon-check'><use xlink:href='#check'></use></svg>`
		});

		const tippyInstance = actions(button, {
			buttonsIs: [true, false],
			onOpen: () => { }
		});

		tippyInstance.options.onEdit = async instance => {
			try {
				this.loader.enable();
				const { question_id, status, channel_id, sale_channel } = params.data;
				const formDataChannel = new FormData();
				const formDataStatus = new FormData();

				formDataChannel.set('question_id', question_id);
				formDataChannel.set('sale_channel_id', channel_id);
				formDataChannel.set('sale_channel', sale_channel);

				formDataStatus.set('question_id', question_id);
				formDataStatus.set('status', status);

				await this.setData('/_set_sale_channel_', formDataChannel);
				await this.setData('/_set_status_', formDataStatus);
			} catch (error) {
				console.log(error);
				throw error;
			} finally {
				instance.isEdit = false;
				this.disableEditing(row);
				this.loader.disable();
			}
		};

		tippyInstance.options.onEnableEdit = () => {
			this.enableEditing(row);
		};

		return button;
	}

	addHandleDbClickCell({ eGridCell }) {
		eGridCell.addEventListener('dblclick', e => {
			const row = eGridCell.closest('.ag-row');
			const wp = eGridCell.querySelector('.wp-input-cell');
			const btnEdit = row.querySelector('.button-table-actions');

			if (wp.classList.contains('not-edit')) {
				btnEdit.classList.add('_edit');
				wp.classList.remove('not-edit');
				// this.validateInput(input)
				// this.setReadonly(input, false)
			}
		});
	}

	onRendering([{ sales = [], cnt_pages, page, cnt_all = 0 }, { sale_channels = [] }]) {
		this.cntAll = cnt_all;
		sales.length && sales.forEach(sale => (sale.sale_channels = sale_channels));
		this.pagination.setPage(page, cnt_pages, cnt_all);
		this.gridApi.setGridOption('rowData', sales);
		// this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, sales.length])
	}

	async setData(route, formData) {
		try {
			const response = await api.post(`${route}`, formData);
			if (response.status !== 200) return null;
			this.app.notify.show(response.data);
			return response.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}

export default TableTransactions;
