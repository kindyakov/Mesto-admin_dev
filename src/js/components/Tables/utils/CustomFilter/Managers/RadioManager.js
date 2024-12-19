import { createElement } from '../../../../../settings/createElement.js';

export class RadioManager {
	constructor() {
		this.selectedRadio = null;
	}

	setContainer(container) {
		this.container = container;
	}

	handleEvent(event) {
		const target = event.target;
		if (target.type === 'radio') {
			this.selectRadio(target);
		}
	}

	selectRadio(radio) {
		this.selectedRadio = radio.value;
	}

	htmlSort({ name, str }) {
		return `
    <input type="radio" name="sort_direction" value="asc" id="filter-radio-${name}-asc">
    <label class="label-radio" for="filter-radio-${name}-asc">
      ${str.asc}
    </label>
    <input type="radio" name="sort_direction" value="desc" id="filter-radio-${name}-desc">
    <label class="label-radio" for="filter-radio-${name}-desc">
      ${str.desc}
    </label>`;
	}

	render({ filterWrapper, currentData, column, ...params }, reqData) {
		const typeData = column.colDef.cellDataType;
		const sortStr = {
			number: {
				asc: '↓ Сортировать по возрастанию',
				desc: '↑ Сортировать по убыванию'
			},
			text: {
				asc: '↓ Сортировать от А до Я',
				desc: '↑ Сортировать от Я до А'
			},
			dateString: {
				asc: '↓ Сортировать от А до Я',
				desc: '↑ Сортировать от Я до А'
			}
		};

		this.wpSort?.remove();
		this.wpSort = createElement('div', {
			classes: ['wp-sort'],
			attributes: [['style', `display:flex;gap:5px;flex-direction:column;`]],
			content: this.htmlSort({ name: column.colDef.field, str: sortStr[typeData] })
		});

		if (reqData.sort_column && reqData.sort_direction && reqData.sort_column == column.colDef.field) {
			this.wpSort.querySelector(`input[value="${reqData.sort_direction}"]`).checked = true;
		}

		if (!filterWrapper.querySelector('.wp-sort')) {
			filterWrapper.appendChild(this.wpSort);
		}
	}
}
