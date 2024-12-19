import uniqBy from 'lodash.uniqby';
import merge from 'lodash.merge';

import Table from '../Table.js';
import CustomFilter from '../utils/CustomFilter/CustomFilter.js';
import { api } from '../../../settings/api.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { createElement } from '../../../settings/createElement.js';
import { cellRendererInput } from '../utils/cellRenderer.js';
import { inputValidator } from '../../../settings/validates.js';
import { cellDatePicker } from '../TablesForecast/utils/cellDatePicker.js';
import { dateFormatter } from '../../../settings/dateFormatter.js';
// import { outputInfo } from '../../../utils/outputinfo.js';
import { sort } from '../../../utils/sort.js';
import { observeCell } from '../utils/observeCell.js';

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
					floatingFilter: false,
					closeOnApply: false,
					filter: null,
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
					minWidth: 100,
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
					minWidth: 100,
					flex: 0.5
				},
				{
					headerName: 'ФИО',
					field: 'fullname',
					minWidth: 250,
					flex: 1
					// cellRenderer: params => {
					// 	const wp = cellRendererInput(params, { iconId: 'profile' });
					// 	observeCell(wp, params);
					// 	return wp;
					// }
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
					minWidth: 100,
					flex: 0.5,
					valueFormatter: params => (params.value ? formattingPrice(params.value.toFixed(0)) : '')
				},
				{
					headerName: 'Новая цена',
					field: 'new_price',
					minWidth: 100,
					flex: 0.6,
					cellRenderer: params => {
						this.addHandleDbClickCell(params);
						return cellRendererInput(params, {
							funcFormate: value => formattingPrice(value.toFixed(0)),
							inputmode: 'numeric'
						});
					}
				},
				{
					headerName: 'Дата новой цены',
					field: 'index_date',
					minWidth: 100,
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
					minWidth: 100,
					flex: 0.6,
					valueFormatter: params => (params.value ? formattingPrice(params.value.toFixed(0)) : '')
				},
				{
					headerName: 'Новая средняя ставка',
					field: 'new_price_1m',
					minWidth: 100,
					flex: 0.6,
					valueFormatter: params => (params.value ? formattingPrice(params.value.toFixed(0)) : '')
				},
				{
					headerName: '',
					field: '',
					width: 80,
					resizable: false,
					sortable: false,
					floatingFilter: false,
					closeOnApply: false,
					filter: null,
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
							content: `<svg xmlns='http://www.w3.org/2000/svg' viewBox="0 0 548.244 548.244" fill='none' class='icon icon-send'><path d="M392.19 156.054 211.268 281.667 22.032 218.58C8.823 214.168-.076 201.775 0 187.852c.077-13.923 9.078-26.24 22.338-30.498L506.15 1.549c11.5-3.697 24.123-.663 32.666 7.88 8.542 8.543 11.577 21.165 7.879 32.666L390.89 525.906c-4.258 13.26-16.575 22.261-30.498 22.338-13.923.076-26.316-8.823-30.728-22.032l-63.393-190.153z"></path></svg>`
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
			rowHeight: 70,
			suppressColumnVirtualisation: true,
			onFilterOpened: e => {
				const field = e.column.colDef.field;
				const filterWrapper = e.eGui.querySelector('.ag-filter-body-wrapper');
				const data = e.api.getGridOption('rowData');
				const fullCurrentData = sort(uniqBy(this.data.map(obj => obj[field]).filter(v => v))); // Сортировка по возрастанию
				const currentData = sort(uniqBy(data.map(obj => obj[field] && obj[field]).filter(v => v))); // Сортировка по возрастанию
				let dataWithoutCurrentFilter = [];

				if (this.queryParams.filters) {
					if (
						Object.keys(this.queryParams.filters).length == 1 &&
						Object.keys(this.queryParams.filters)[0] == field
					) {
						dataWithoutCurrentFilter = fullCurrentData.filter(
							value => !currentData.includes(value)
						);
					} else if (Object.keys(this.queryParams.filters).length >= 2) {
						dataWithoutCurrentFilter = this.filterAndSortData(this.data, {
							...this.queryParams,
							filters: Object.keys(this.queryParams.filters).reduce((filteredObj, key) => {
								if (key !== field) {
									filteredObj[key] = this.queryParams.filters[key];
								}
								return filteredObj;
							}, {}) // Без учета текущего фильтра
						})
							.map(obj => obj[field])
							.filter(value => !currentData.includes(value))
							.sort((a, b) => a - b); // Сортировка по возрастанию
					}

					if (dataWithoutCurrentFilter?.length) {
						dataWithoutCurrentFilter = uniqBy(dataWithoutCurrentFilter);
					}
				}

				const params = {
					...e,
					filterWrapper,
					currentData,
					data,
					fullCurrentData,
					dataWithoutCurrentFilter
				};

				this.customFilter.init(params);
				this.customFilter.gridApi = this.gridApi;
				this.customFilter.wpTable = this.wpTable;
				this.customFilter.render(params, this.queryParams);
				this.customFilter.onChangeColumnParams = params => {
					e.column.colDef.filterValues = merge(e.column.colDef.filterValues || {}, params);
				};
			}, // сработает при открытие окна с фильтром
			defaultColDef: {
				filter: 'agTextColumnFilter',
				floatingFilter: true, // Добавляет панельку под заголовком
				closeOnApply: true,
				sortable: false
			}
		};

		const defaultParams = {};

		const mergedOptions = Object.assign({}, defaultOptions, options);
		const mergedParams = Object.assign({}, defaultParams, params);
		super(selector, mergedOptions, mergedParams);

		this.contentMain = this.table.closest('.content-main');
		this.widget = this.contentMain.querySelector('[data-render-widget="calc-table"]');
		this.validateInputHandler = this.validateInput.bind(this);
		this.saveData = [];
		this.data = [];

		this.customFilter = new CustomFilter();
		this.customFilter.onChange = queryParams => {
			// this.changeQueryParams(queryParams)
			this.btnTableFilterReset?.classList.toggle(
				'_is-filter',
				!(!queryParams.filters && !queryParams.sort_direction)
			);

			this.queryParams = queryParams;

			this.tableRendering(queryParams);
		};

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
				this.validateInput(input);
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

		if (typeof rowNode.data.new_price === 'string') {
			rowNode.data.new_price = Number(rowNode.data.new_price.replace(/\D/g, ''));
		}

		this.gridApi.refreshCells({
			rowNodes: [rowNode],
			force: true // опционально, заставит рендерить все ячейки, даже если данные не изменились
		});

		this.saveData.push(rowNode.data);
		this.data = this.data.map(obj => (obj.room_id == rowNode.data.room_id ? rowNode.data : obj));

		params.colDef.btnSend.classList.add('_active');

		this.changeWidget();
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
			const btnSave = row.querySelector('.btn-save');

			if (input.classList.contains('not-edit')) {
				btnEdit.classList.add('_edit');
				btnSave?.classList.add('_active');
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

	changeWidget(data = this.data) {
		const sumNewPrice = data.reduce((acc, obj) => acc + obj.new_price, 0);
		const sumArea = data.reduce((acc, obj) => acc + obj.area, 0);
		const result = +(sumNewPrice / sumArea).toFixed(0);

		this.widget.innerHTML = formattingPrice(result);
	}

	onRendering({ indexations = [], cnt_pages, page, cnt_all = 0 }) {
		// this.pagination.setPage(page, cnt_pages, cnt_all)
		// this.cntAll = cnt_all;
		this.saveData = [];
		if (!this.data.length) {
			this.data = indexations;
		}
		this.changeWidget(indexations);
		this.gridApi.setGridOption('rowData', indexations);

		// this.gridApi.setGridOption('paginationPageSizeSelector', [5, 10, 15, 20, timepoints.length]);
	}

	filterAndSortData(data, params) {
		const { filters = {}, sort_column, sort_direction } = params;

		let result = data;

		// Фильтрация по объекту filters
		if (filters && Object.keys(filters).length > 0) {
			result = result.filter(item => {
				return Object.entries(filters).every(([key, values]) => {
					if (Array.isArray(values) && values.length) {
						return values.includes(String(item[key])); // Приводим к строке для совпадения
					}
					return true; // Пропускаем фильтр, если формат некорректный
				});
			});
		}

		// Сортировка
		if (sort_column && sort_direction) {
			result.sort((a, b) => {
				const valA = a[sort_column];
				const valB = b[sort_column];

				if (sort_direction === 'asc') {
					return valA > valB ? 1 : valA < valB ? -1 : 0;
				} else if (sort_direction === 'desc') {
					return valA < valB ? 1 : valA > valB ? -1 : 0;
				}
				return 0; // Если sort_direction некорректен
			});
		}

		return result;
	}

	tableRendering(queryParams = {}) {
		let data = this.filterAndSortData(this.data, queryParams);

		this.onRendering({ ...queryParams, indexations: data });
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
