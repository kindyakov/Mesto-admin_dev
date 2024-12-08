import { createElement } from '../../../settings/createElement.js';

class CustomFilterComponent {
	init(params) {
		this.params = params;
		this.gui = createElement('div');
		this.gui.innerHTML = `
      <div class="custom-filter">
        <label>Поиск:</label>
        <input type="text" id="filter-input" placeholder="Введите значение">
        <button id="filter-apply">Применить</button>
        <button id="filter-reset">Сбросить</button>
      </div>
    `;

		this.inputElement = this.gui.querySelector('#filter-input');
		this.applyButton = this.gui.querySelector('#filter-apply');
		this.resetButton = this.gui.querySelector('#filter-reset');

		// Привязка событий
		this.applyButton.addEventListener('click', () => this.applyFilter());
		this.resetButton.addEventListener('click', () => this.resetFilter());
	}

	applyFilter() {
		const filterValue = this.inputElement.value.toLowerCase();
		this.params.filterChangedCallback(); // Уведомляем таблицу о смене фильтра
		this.filterValue = filterValue;
	}

	resetFilter() {
		this.inputElement.value = '';
		this.filterValue = null;
		this.params.filterChangedCallback();
	}

	doesFilterPass(params) {
		const { api, colDef, column, columnApi, context } = this.params;
		const value = params.data[colDef.field];
		return this.filterValue ? value.toLowerCase().includes(this.filterValue) : true;
	}

	isFilterActive() {
		return this.filterValue != null && this.filterValue !== '';
	}

	getModel() {
		return this.filterValue ? { value: this.filterValue } : null;
	}

	setModel(model) {
		this.filterValue = model ? model.value : null;
		this.inputElement.value = this.filterValue || '';
	}

	getGui() {
		return this.gui;
	}
}

export default CustomFilterComponent;
