import { createElement } from '../../../settings/createElement.js';

/**
 * Обновляет заголовки колонок, добавляя или обновляя вспомогательный текст (.text-info).
 * @param {Object} params
 * @param {HTMLElement} params.tableElement - Корневой элемент таблицы (AG Grid).
 * @param {Object} params.data - Данные для вычисления значений.
 * @param {Object.<number,function>} params.columnMap - Мапа: индекс колонки → функция (data) => value.
 */
export const renderTextHeader = ({ tableElement, data = {}, columnMap = {} }) => {
	if (!tableElement || !Object.keys(columnMap).length) return;

	const headers = tableElement.querySelectorAll('.ag-header-cell');
	if (!headers.length) return;

	const renderCell = (th, getValue) => {
		if (typeof getValue !== 'function') return;

		const label = th.querySelector('.ag-header-cell-label');
		if (!label) return;

		const value = getValue(data);
		if (value === undefined || value === null) return;

		const existed = label.querySelector('.text-info');
		if (existed) {
			existed.innerText = value;
			return;
		}

		const spanText = label.querySelector('.ag-header-cell-text');
		if (!spanText) return;

		const headerName = spanText.innerText;
		spanText.remove();

		const header = createElement('div', {
			classes: ['ag-header-cell-text', 'custom-header'],
			content: `${headerName} <span class="text-info" style="font-size:12px;">${value}</span>`
		});

		label.prepend(header);
	};

	headers.forEach((th, index) => {
		const getter = columnMap[index];
		if (getter) renderCell(th, getter);
	});
};
