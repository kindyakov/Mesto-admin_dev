import merge from 'lodash.merge';
import mergeWith from 'lodash.mergewith';
import { CheckboxManager } from './Managers/CheckboxManager.js';
import { RadioManager } from './Managers/RadioManager.js';
import { createElement } from '../../../../settings/createElement.js';

class CustomFilter {
	constructor() {
		this.checkboxManager = new CheckboxManager();
		this.radioManager = new RadioManager();

		this.checkboxes = [];
		this.inputsRadio = [];

		this.btnOk = createElement('button', { classes: ['button', 'table-button'], content: 'Ок' });
		this.btnCancel = createElement('button', {
			classes: ['button', 'table-button', 'transparent'],
			content: 'Отмена'
		});

		this.btnOk.addEventListener('click', e => this.handleClickBtnOk(e));
		this.btnCancel.addEventListener('click', e => this.handleClickBtnCancel(e));

		this.reqData = { filters: {} };

		this.handleEvent = this.handleEvent.bind(this);
	}

	onOk() {}

	onChange() {}

	onChangeColumnParams(params) {}

	onClearFiltersCol() {}

	init({ filterWrapper, ...params }) {
		this.container?.removeEventListener('change', this.handleEvent);

		this.container = filterWrapper;
		this.container.addEventListener('change', this.handleEvent);
	}

	handleEvent(e) {
		const target = e.target;

		if (target.type === 'checkbox') {
			this.checkboxManager.handleEvent(e);
			this.changeParamsFilter(e);
		} else if (target.type === 'radio') {
			this.radioManager.handleEvent(e);
			this.handleClickBtnOk(e);
		}
	}

	changeReqData(params) {
		this.reqData = mergeWith(this.reqData, params, (objValue, srcValue) => {
			if (Array.isArray(objValue)) {
				return srcValue; // Заменяем массив вместо объединения
			}
		});

		this.toggleFilterClass(this.params.column.colDef.field, true);
		this.closeFilter(this.params.column.colDef.field);

		this.onChange(this.reqData);
	}

	changeParamsFilter(e) {
		const form = e.target.closest('form');
		const formData = new FormData(form);
		const dataArray = Array.from(formData.entries());

		let data = { enable_filter: 1, filters: {} };

		dataArray.forEach(([key, value]) => {
			if (key.split('-').length == 2) {
				key = key.split('-')[1];

				if (!data.filters[key]) {
					data.filters[key] = [];
				}

				value && data.filters[key].push(value);
			} else {
				data[key] = !isNaN(+value) ? +value : value;
				data.sort_column = this.params.column.colDef.field;
			}
		});

		this.onChangeColumnParams(data);

		return data;
	}

	handleClickBtnOk(e) {
		const filtersCurrentColumn = this.changeParamsFilter(e);

		this.changeReqData(filtersCurrentColumn);
	}

	handleClickBtnCancel(e) {
		const form = e.target.closest('form');
		const key = this.params.column.colDef.field;

		Array.from(form).forEach(el => {
			if (el.tagName === 'INPUT') {
				if (el.type == 'radio' && el.checked) {
					delete this.reqData.sort_direction;
					delete this.reqData.sort_column;
				}

				if (el.classList.contains('input-search')) {
					el.value = '';
				}

				if (el.name == 'real_payment') {
					delete this.reqData.real_payment;
				}

				el.checked = false;
			}
		});

		if (this.reqData.filters) {
			delete this.reqData.filters?.[key];

			if (!Object.keys(this.reqData.filters).length) {
				delete this.reqData.filters;
				delete this.reqData.enable_filter;
			}
		}

		this.params.column.colDef.clearCustomFilter?.();

		this.onClearFiltersCol(e, this);
		this.toggleFilterClass();

		this.closeFilter(key);
		this.onChange(this.reqData);
	}

	handleInputSearch(e, params) {
		const { filterWrapper, currentData, data, fullCurrentData, column } = params;
		const listValues = filterWrapper.querySelector('.col-data-list');
		const items = listValues.querySelectorAll('li');
		const searchStr = e.target.value.toLowerCase().trim();

		items.forEach(item => {
			const input = item.querySelector('input');
			const value = input.value.toLowerCase().trim();

			if (input.classList.contains('all')) return;

			if (value.search(searchStr) !== -1) {
				item.classList.remove('_none');
				input.disabled = false;
			} else {
				item.classList.add('_none');
				input.disabled = true;
			}
		});
	}

	toggleFilterClass() {
		const keys = this.reqData.filters ? Object.keys(this.reqData.filters) : [];

		if (keys.length) {
			keys.forEach(key => {
				const headerCell = this.wpTable.querySelector(`.ag-header-cell[col-id="${key}"]`);
				const floatingFilter = this.wpTable.querySelector(
					`.ag-header-cell.ag-floating-filter[aria-colindex="${headerCell.getAttribute('aria-colindex')}"]`
				);
				const filterButton = floatingFilter?.querySelector('button');

				if (floatingFilter) {
					setTimeout(() => filterButton.classList.toggle('ag-filter-active', true));
				}
			});
		}
	}

	closeFilter(columnField) {
		// const filterInstance = gridOptions.api.getFilterInstance(columnField);
		if (this.gridApi?.hidePopupMenu) {
			this.gridApi.hidePopupMenu();
		}
		// if (filterInstance) {
		//   gridOptions.api.hidePopup(); // Скрывает текущее всплывающее окно
		//   console.log(`Фильтр для колонки "${columnField}" закрыт`);
		// }
	}

	renderInputSearch(params) {
		const { filterWrapper, currentData, data, column } = params;

		const defaultInput = filterWrapper.querySelector('.ag-filter-body');
		defaultInput?.classList.add('_none');

		if (filterWrapper.querySelector('.input-search')) return;
		defaultInput.insertAdjacentHTML('afterend', `<div class="wp-input"></div>`);
		const searchInputContainer = filterWrapper.querySelector('.wp-input');
		const input = createElement('input', {
			classes: ['input', 'input-search'],
			attributes: [
				['type', 'text'],
				['autocomplete', 'off'],
				['placeholder', 'Поиск']
			]
		});

		searchInputContainer.appendChild(input);
		input.addEventListener('input', e => this.handleInputSearch(e, params));
	}

	render(params, queryParams) {
		const { filterWrapper } = params;

		this.wpButtons =
			this.wpButtons ||
			createElement('div', {
				classes: ['wp-buttons'],
				attributes: [['style', `display:flex;gap:5px;justify-content:flex-end;`]]
			});

		this.reqData = queryParams;

		this.renderInputSearch(params);
		this.radioManager.render(params, this.reqData);
		this.checkboxManager.render(params, this.reqData);

		this.wpButtons.appendChild(this.btnOk);
		this.wpButtons.appendChild(this.btnCancel);
		filterWrapper.appendChild(this.wpButtons);

		params.column.colDef.filterRenderer?.(params);

		this.params = merge(this.params, params);
	}
}

export default CustomFilter;
