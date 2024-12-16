import Table from '../Table.js';
import { api } from '../../../settings/api.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { createElement } from '../../../settings/createElement.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { inputValidator } from '../../../settings/validates.js';
import { cellDatePicker } from '../TablesForecast/utils/cellDatePicker.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
import { outputInfo } from '../../../utils/outputinfo.js';

class TableIndexation extends Table {
	constructor(selector, options, params) {
		const defaultOptions = {
			columnDefs: [
				{
					headerName: '',
					field: '',
					width: 50,
					resizable: false,
					sortable: false,
					cellRenderer: params => {
						const row = params.eGridCell.closest('.ag-row');
						const button = createElement('button', {
							classes: ['button-table-row-edit'],
							content: `<svg class='icon icon-edit edit'><use xlink:href='img/svg/sprite.svg#edit'></use></svg>`
						});

						params.colDef.btnEdit = button;
						button.addEventListener('click', () => this.handleClickBtnEdit(params, button));

						if (params.data.status == -1 && row) {
							row.classList.add('bg-yellow');
						}

						return button;
					}
				},
				{
					headerName: 'Ячейка',
					field: 'room_name',
					minWidth: 70,
					flex: 0.4
				},
				{
					headerName: 'Размеры',
					field: 'dimensions',
					minWidth: 100,
					flex: 0.6
				},
				{
					headerName: 'Договор',
					field: 'agrid',
					minWidth: 70,
					flex: 0.5
				},
				{
					headerName: 'ФИО',
					field: 'fullname',
					minWidth: 200,
					flex: 1
				},
				{
					headerName: 'Площадь',
					field: 'area',
					minWidth: 100,
					flex: 0.6
				},
				{
					headerName: 'Цена',
					field: 'price',
					minWidth: 80,
					flex: 0.5,
					valueFormatter: params => (params.value ? formattingPrice(params.value) : '')
				},
				{
					headerName: 'Новая цена',
					field: 'new_price',
					minWidth: 60,
					flex: 0.6,
					cellRenderer: params => {
						this.addHandleDbClickCell(params);
						return cellRendererInput(params, {
							funcFormate: formattingPrice,
							inputmode: 'numeric'
						});
					}
				},
				{
					headerName: 'Дата новой цены',
					field: 'index_date',
					minWidth: 60,
					flex: 0.6,
					cellRenderer: params => {
						// Определяем формат даты на основе наличия дня
						const el = cellRendererInput(params, {
							funcFormate: value => {
								dateFormatter(value);
							}
						});

						cellDatePicker(el.querySelector('input'), {
							params,
							prefixClass: 'table-indexation',
							hasDay: true
						});

						this.addHandleDbClickCell(params);

						return el;
					}
				},
				{
					headerName: 'Cредняя ставка',
					field: 'price_1m',
					minWidth: 60,
					flex: 0.6,
					valueFormatter: params => (params.value ? formattingPrice(params.value) : '')
				},
				{
					headerName: 'Новая средняя ставка',
					field: 'new_price_1m',
					minWidth: 60,
					flex: 0.6,
					valueFormatter: params => (params.value ? formattingPrice(params.value) : '')
				},
				{
					headerName: '',
					field: '',
					width: 80,
					resizable: false,
					sortable: false,
					cellRenderer: params => {
						const wp = createElement('div', {
							classes: ['row-buttons'],
							attributes: [['style', `display:flex;flex-direction:column;gap:5px;`]]
						});

						const btnSave = createElement('button', {
							classes: ['button-table', 'btn-save'],
							content: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' class='icon icon-save'><path d='M6 7.33366L8 9.33366L14.6667 2.66699' stroke-linecap='round' stroke-linejoin='round' /><path d='M14 8V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H10.6667' stroke-linecap='round' stroke-linejoin='round'/></svg>`
						});

						const btnSend = createElement('button', {
							classes: ['button-table', 'btn-send'],
							content: `<svg class='icon icon-send'><use xlink:href='./img/svg/sprite.svg#send'></use></svg>`
						});

						wp.appendChild(btnSave);
						wp.appendChild(btnSend);

						btnSave.addEventListener('click', () =>
							this.handleClickBtnSave(params, btnSave, btnSend)
						);
						btnSend.addEventListener('click', () => this.handleClickBtnSend(params, btnSend));

						params.colDef.btnSave = btnSave;
						params.colDef.btnSend = btnSend;

						return wp;
					}
				}
			],
			pagination: false,
			rowHeight: 70
		};

		const defaultParams = {};

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		this.contentMain = this.table.closest('.content-main');
		this.widget = this.contentMain.querySelector('[data-render-widget="calc-table"]');
		this.validateInputHandler = this.validateInput.bind(this);
		this.saveData = [];

		// this.gridOptions.navigation.beforeSwitchTab = () => {
		// 	let isMove = true;

		// 	if (this.saveData.length) {
		// 		outputInfo(
		// 			{
		// 				msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите покинуть вкладку?',
		// 				msg_type: 'warning',
		// 				isConfirm: true
		// 			},
		// 			isConfirm => {
		// 				if (isConfirm) {
		// 				}
		// 			}
		// 		);
		// 		isMove = false;
		// 	}

		// 	return isMove;
		// };

		window.addEventListener('beforeunload', e => {
			if (this.saveData.length) {
				e.preventDefault();
				e.returnValue = '';
			}
		});
	}

	handleClickBtnEdit(params, btn) {
		const row = params.eGridCell.closest('.ag-row');
		const inputs = row.querySelectorAll('.cell-input');
		const isEditMode = btn.classList.toggle('_edit');
		const btnSave = row.querySelector('.btn-save');

		inputs.length &&
			inputs.forEach(input => {
				this.setReadonly(input, !isEditMode);
				if (isEditMode) {
					input.addEventListener('input', this.validateInputHandler);
				} else {
					input.removeEventListener('input', this.validateInputHandler);
				}
			});

		btnSave.classList.toggle('_active', isEditMode);
	}

	handleClickBtnSave(params, btnSave, btnSend) {
		if (!btnSave.classList.contains('_active')) return;

		let { data } = params;
		const row = params.eGridCell.closest('.ag-row');
		const inputs = row.querySelectorAll('.cell-input');
		let isValid = true;

		inputs.length &&
			inputs.forEach(input => {
				data[input.name] =
					input.name === 'index_date'
						? input.dataset.value
						: !isNaN(+input.value)
							? +input.value
							: input.value;

				if (!input.value) {
					input.classList.add('_err');
					isValid = false;
				} else {
					input.classList.remove('_err');
				}
			});

		if (!isValid) return;

		const rowNode = this.gridApi.getRowNode(params.node.id);

		this.gridApi.refreshCells({
			rowNodes: [rowNode],
			force: true // опционально, заставит рендерить все ячейки, даже если данные не изменились
		});

		this.saveData.push(rowNode.data);

		params.colDef.btnSend.classList.add('_active');

		this.changeWidget(this.saveData);
	}

	handleClickBtnSend(params, btn) {
		if (!btn.classList.contains('_active')) return;
		let { room_id, new_price, price, index_date } = params.data;
		const data = { room_id, index_sum: new_price - price, index_date };
		this.planIndexation(data).finally(() => {
			btn.classList.remove('_active');
			this.saveData = this.saveData.filter(obj => obj.room_id !== room_id);
		});
	}

	addHandleDbClickCell(params) {
		params.eGridCell.addEventListener('dblclick', e => {
			const row = params.eGridCell.closest('.ag-row');
			const input = e.target.closest('input');
			const btnEdit = row.querySelector('.button-table-row-edit');

			if (input.classList.contains('not-edit')) {
				btnEdit.classList.add('_edit');
				this.validateInput(input);
				this.setReadonly(input);
			}
		});
	}

	setReadonly(input, isReadonly = false) {
		if (isReadonly) {
			input.setAttribute('readonly', 'true');
			input.classList.add('not-edit');
		} else {
			input.removeAttribute('readonly');
			input.classList.remove('not-edit');
		}
	}

	validateInput(e) {
		const input = e.target || e;
		const inputMode = input.getAttribute('inputmode');
		const validator = inputValidator[inputMode];
		const _input = validator ? validator(input) : input;

		if (_input.value) {
			_input.classList.remove('_err');
		} else {
			// _input.classList.add('_err');
		}

		return !_input.classList.contains('_err');
	}

	changeWidget(saveData = this.saveData) {
		const sumNewPrice = saveData.reduce((acc, obj) => acc + obj.new_price, 0);
		const sumArea = this.data.reduce((acc, obj) => acc + obj.area, 0);
		const result = +(sumNewPrice / sumArea).toFixed(2);

		this.widget.innerText = formattingPrice(result);
	}

	onRendering({ indexations = [], cnt_pages, page, cnt_all = 0 }) {
		// this.pagination.setPage(page, cnt_pages, cnt_all)
		// this.cntAll = cnt_all;
		this.saveData = [];
		this.data = indexations;
		this.gridApi.setGridOption('rowData', indexations);
		// this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, timepoints.length]);
	}

	async planIndexation(data) {
		try {
			this.loader.enable();
			const response = await api.post(`/_plan_indexation_`, data);
			if (response.status !== 200) return;
			console.log(response.data);
			this.app.notify.show(response.data);
		} catch (error) {
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default TableIndexation;
