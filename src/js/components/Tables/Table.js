import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { createGrid } from 'ag-grid-community';
import { translations } from './translations.js';
import Pagination from '../../components/Pagination/Pagination.js';
import { Loader } from '../../modules/myLoader.js';
import { Select } from '../../modules/mySelect.js';
import { createCalendar } from '../../settings/createCalendar.js';
import { mergeQueryParams } from '../../utils/buildQueryParams.js';
import { dateFormatter } from '../../settings/dateFormatter.js';
import { inputValidator } from '../../settings/validates.js';

class Table {
	constructor(selector, options, params) {
		let defaultParams = {
			isPagination: true,
			paginationCountBtn: 5,
			timerReadonly: false, // Включает обновлении ячейки после опр. времени
			getData: async () => {},
			onSubmitSearch: () => {},
			onValidateSearch: () => {},
			onValueInputSearch: () => {}
		};

		let defaultoptions = {
			table: {},
			columnDefs: [],
			rowData: [],
			pagination: true,
			paginationPageSize: 5,
			paginationPageSizeSelector: [5, 10, 15, 20, 30],
			suppressRowClickSelection: true, // Отключение выбора строки при клике на ячейку
			suppressHorizontalScroll: false,
			// suppressPaginationPanel: true,
			suppressScrollOnNewData: true,
			enableCellTextSelection: true, // разрешить выделять текст
			rowSelection: 'multiple', // Включение множественного выбора строк
			rowHeight: 60,
			domLayout: 'normal',
			localeText: translations,
			getLocaleText: this.getLocaleText,
			onCellClicked: params => {
				if (params.column.colId === 'checkboxSelection') {
					params.node.setSelected(!params.node.isSelected());
				}
			},
			onGridReady: params => {
				this.gridApi = params.api;
				this.gridColumnApi = params.columnApi;
				this.tableHeader = options.wrapper.querySelector(`${selector} .ag-header`);
				this.tableFooter = options.wrapper.querySelector(`${selector} .ag-paging-panel`);
				this.checkboxInputHeader = this.tableHeader.querySelector('.ag-checkbox-input');

				this.tableFooter.querySelector(`${selector} .ag-paging-row-summary-panel`)?.remove();
				this.tableFooter.querySelector(`${selector} .ag-paging-page-summary-panel`)?.remove();
				this.tableFooter.querySelector(`${selector} .ag-paging-page-size`)?.remove();

				this.init();
			},
			onRowSelected: params => this.onRowSelected(params),
			onSortChanged: params => {
				const columnState = params.api.getColumnState();
				const [sortedColumn] = columnState
					.filter(col => col.sort) // Фильтруем только отсортированные колонки
					.map(col => ({ colId: col.colId, sort: col.sort }));
				if (sortedColumn) {
					const { colId, sort } = sortedColumn;
					this.btnTableFilterReset?.classList.add('_is-filter');
					this.changeQueryParams({ sort_column: colId, sort_direction: sort });
				} else {
					this.formTableSearch?.reset();
					this.queryParams = { show_cnt: this.gridOptions.paginationPageSize };
					this.btnTableFilterReset?.classList.remove('_is-filter');
					this.changeQueryParams({});
				}
			},
			onFilterChanged: params => {}
		};

		this.selector = selector;
		this.params = Object.assign(defaultParams, params);
		this.gridOptions = Object.assign(defaultoptions, options);

		this.getData = this.params.getData;
		this.onSubmitSearch = this.params.onSubmitSearch;
		this.onValidateSearch = this.params.onValidateSearch;

		this.grid = createGrid(this.gridOptions.wrapper.querySelector(selector), this.gridOptions);
		this.table = this.gridOptions.wrapper.querySelector(selector);
		this.wpTable = this.table.closest('.table');
		this.app = window.app;

		this.onRowSelected = this.onRowSelected.bind(this);

		this.selectedRows = [];
		this.queryParams = { show_cnt: this.gridOptions.paginationPageSize };
		this.onReadyFunctions = [];

		this.validateInputHandler = this.validateInput.bind(this);
	}

	onInit() {
		this.onReadyFunctions.forEach(fun => {
			fun(this);
		});
	}

	onChangeSelect({ e, select, value }) {
		this.changeQueryParams({ [select.getAttribute('data-name')]: !isNaN(+value) ? +value : value });
	}

	initPaging() {
		if (!this.params.isPagination) return;
		this.pagination = new Pagination(this.tableFooter, {
			pageSize: this.gridOptions.paginationPageSize,
			countBtn: this.params.paginationCountBtn
		});
	}

	init() {
		if (!this.table) return;
		this.wpTable = this.table.closest('.table');
		this.formTableSearch = this.wpTable.querySelector('.form-table-search');
		this.inputTableSearch = this.wpTable.querySelector('.input-table-search');
		this.btnTableUploadExcel = this.wpTable.querySelector('.btn-table-upload-excel');
		this.btnTableFilterReset = this.wpTable.querySelector('.btn-filter-reset');

		this.loader = new Loader(this.wpTable);
		this.selects =
			this.selects || new Select({ uniqueName: 'select-filter-table', parentEl: this.wpTable });
		this.calendar = createCalendar(this.wpTable.querySelector('.input-date-filter'), {
			mode: 'range',
			dateFormat: 'd. M, Y'
		});

		this.initPaging();
		this.onInit();
		this.events();
	}

	events() {
		if (this.btnTableUploadExcel) {
			this.btnTableUploadExcel.addEventListener('click', this.handleBtnUploadExcel.bind(this));
		}

		if (this.btnTableFilterReset) {
			this.btnTableFilterReset.addEventListener('click', this.handleClickFilterReset.bind(this));
		}

		if (this.formTableSearch) {
			let timerSearch;

			this.formTableSearch.addEventListener('submit', this.submitFormSearch.bind(this));

			this.inputTableSearch &&
				this.inputTableSearch.addEventListener('input', e => {
					clearTimeout(timerSearch);
					timerSearch = setTimeout(() => {
						this.changeQueryParams({ [e.target.name]: e.target.value });
					}, 500);
				});
		}

		if (this.selects) {
			this.selects.selects.forEach(select => {
				this.queryParams[select.name] = !isNaN(+select.value) ? +select.value : select.value;
			});
			this.selects.onChange = (e, select, value) => this.onChangeSelect({ e, select, value });
		}

		if (this.calendar) {
			this.calendar.methods.onChange = (selectedDates, dateStr, instance) => {
				if (selectedDates.length === 2) {
					const [start, end] = instance.element.name.split(',');
					this.changeQueryParams({
						[start]: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
						[end]: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
					});
				}
			};
		}

		if (this.params.isPagination && this.pagination) {
			this.pagination.onChangeShowCount = count => {
				this.changeQueryParams({ show_cnt: count, page: null });
				this.gridApi.setGridOption('paginationPageSize', count);
			};
			this.pagination.onPageChange = page => this.changeQueryParams({ page });
		}

		if (this.wpTable) {
			this.wpTable.addEventListener('click', e => this.handlesClickWpTable(e));
		}
	}

	handlesClickWpTable(e) {
		if (e.target.closest('.btn-add-stroke')) {
			this.addRowTable(e);
		}
	}

	beforeAddRow(emptyRow) {
		return emptyRow;
	}

	afterAddRow(emptyRow) {}
	// Добавляет новую строку в таблицу
	addRowTable(e) {
		const columnDefs = this.gridOptions.columnDefs;
		let emptyRow = {};

		// Формируем объект строки с пустыми значениями на основе columnDefs
		columnDefs?.length &&
			columnDefs.forEach(colDef => {
				if (colDef.field) {
					// Проверяем, есть ли ключ field
					emptyRow[colDef.field] = ''; // Устанавливаем пустое значение
				}
			});

		emptyRow = this.beforeAddRow(emptyRow);

		// Добавление строки в таблицу
		this.gridApi.applyTransaction({ add: [emptyRow] });

		// Получение DOM-элемент строки
		let rowsNode = this.getAllRowsWithElements();

		setTimeout(() => this.afterAddRow(rowsNode?.at(-1) || {}), 100);
	}

	getLocaleText(params) {
		return translations[params.key] || params.defaultValue;
	}

	// срабатывает "submit" у form search
	submitFormSearch(e) {
		e.preventDefault();
		this.onValidateSearch(this.formTableSearch);
	}

	// Срабатывает при change у checkbox
	onRowSelected(currentData) {
		this.selectedRows = this.gridApi.getSelectedRows();
		this.btnTableUploadExcel.setAttribute(
			'data-count',
			this.selectedRows.length ? `(${this.selectedRows.length})` : ''
		);
		this.handleRowSelected(currentData, this.selectedRows);
	}

	// Обработчик сброс фильтров таблицы
	handleClickFilterReset() {
		this.gridApi.setFilterModel(null);
		this.gridApi.applyColumnState({
			defaultState: { sort: null }
		});
		this.gridApi.onFilterChanged();
		this.gridApi.onSortChanged();
	}

	// Обработчик клика по кнопке "Выгрузить в excel"
	handleBtnUploadExcel() {
		if (this.selectedRows.length) {
			this.download(this.selectedRows, this.checkboxInputHeader.checked);
			this.gridApi.deselectAll();
		} else {
			this.app.notify.show({ msg: 'Вы не выбрали элементы для выгрузки', msg_type: 'warning' });
		}
	}

	handleRowSelected(currentData) {}

	enableEditing(row) {
		if (!row) return [];
		const els = row.querySelectorAll('.cell-input, .mySelect');

		els.length &&
			els.forEach(el => {
				const wpInput = el.closest('.wp-input-cell');
				wpInput.classList.remove('not-edit');
				el.classList.remove('not-edit');
				el.removeAttribute('readonly');
			});

		return els;
	}

	disableEditing(row) {
		if (!row) return;
		const els = row.querySelectorAll('.cell-input, .mySelect');
		const btn = row.querySelector('.button-table-actions');

		els.length &&
			els.forEach(el => {
				const wpInput = el.closest('.wp-input-cell');
				wpInput.classList.add('not-edit');
				el.classList.add('not-edit');
				el.setAttribute('readonly', true);
			});

		btn.classList.remove('_edit');
	}

	validateInput(e) {
		const input = e?.target || e;
		const inputMode = input.getAttribute('inputmode');
		const validator = inputValidator[inputMode];
		const _input = validator ? validator(input) : input;

		if (_input.value) {
			_input.classList.remove('_err');
			const rowId = _input.closest('[row-id]')?.getAttribute('row-id') || null;
			if (rowId !== null && this.params.timerReadonly) {
				let timer = null;
				clearTimeout(timer);
				timer = setTimeout(() => {
					this.updateCellValue(rowId, _input.name, _input.value);
					this.changeReadonly(_input, true);
				}, 3000);
			}
		} else {
			// _input.classList.add('_err');
		}

		return !_input.classList.contains('_err');
	}

	updateCellValue(rowId, field, newValue) {
		const rowNode = this.gridApi.getRowNode(rowId);
		if (rowNode) {
			const currentValue = rowNode.data[field];
			const updatedValue = typeof currentValue === 'number' ? Number(newValue) : String(newValue);
			const result = rowNode.setDataValue(field, updatedValue);
			// rowNode.setData({ ...rowNode.data, [field]: newValue });
		}
	}

	changeReadonly(input, isReadonly = false) {
		const wpInput = input.closest('.wp-input');

		if (isReadonly) {
			if (input.localName == 'input') {
				input.setAttribute('readonly', 'true');
				input.classList.add('not-edit');
				input.removeEventListener('input', this.validateInputHandler);
			}

			wpInput?.classList.add('not-edit');
		} else {
			if (input.localName == 'input') {
				this.validateInput(input);
				input.removeAttribute('readonly');
				input.classList.remove('not-edit');
				input.addEventListener('input', this.validateInputHandler);
			}
			wpInput?.classList.remove('not-edit');
		}
	}

	changeQueryParams(params) {
		this.queryParams = mergeQueryParams(this.queryParams, params);
		this.tableRendering(this.queryParams);
	}

	getAllRows() {
		let rowData = [];
		const rowCount = this.gridApi.getDisplayedRowCount();

		for (let i = 0; i < rowCount; i++) {
			let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
			rowData.push(rowNode.data);
		}

		return rowData;
	}

	getAllRowsWithElements() {
		let rowsWithElements = [];
		const rowCount = this.gridApi.getDisplayedRowCount();

		for (let i = 0; i < rowCount; i++) {
			let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
			let rowElement = this.wpTable.querySelector(`.ag-row[row-id="${rowNode.id}"]`);

			rowsWithElements.push({
				data: rowNode.data,
				element: rowElement
			});
		}

		return rowsWithElements;
	}

	onRendering(data) {
		console.log(data);
	}

	async tableRendering(queryParams = {}) {
		try {
			this.loader.enable();
			const data = await this.getData(queryParams);

			this.onRendering(data);
		} catch (error) {
			console.error(error);
		} finally {
			this.loader.disable();
		}
	}
}

export default Table;
