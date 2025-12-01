import { Parser } from 'expr-eval';
import tippy from '../configs/tippy.js';
import { dateFormatter } from '../settings/dateFormatter.js';
import { formattingPrice } from './formattingPrice.js';

const parser = new Parser();

// Функция для вычисления математических выражений
function calculateExpression(expression, data) {
	if (expression.includes(',')) {
		return null;
	}
	// Проверяем, есть ли математические операторы
	if (!/[\+\-\*\/\(\)]/.test(expression)) {
		return null; // Это не выражение, а обычный ключ
	}

	try {
		// Извлекаем все переменные из выражения
		const variables = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

		const safeData = {};
		variables.forEach(variable => {
			safeData[variable] = data[variable] ?? 0;
		});

		const expr = parser.parse(expression);
		return expr.evaluate(safeData);
	} catch (e) {
		console.error('Ошибка вычисления выражения:', expression, e);
		return 0;
	}
}

/**
 * Рендерит виджеты с данными
 * @param {Object} data - Данные для отображения в виджетах
 * @param {HTMLElement|NodeList} widgetElements - Элементы виджетов или родительский элемент
 * @param {Object} queryParams - Параметры запроса (start_date, end_date)
 * @param {Array} defaultDate - Выбранные даты [startDate, endDate] (опционально)
 */
export function renderWidgets(data, widgetElements, queryParams = {}, defaultDate = null) {
	// Если передан родительский элемент, ищем виджеты внутри него
	let widgets;
	if (widgetElements instanceof HTMLElement) {
		widgets = widgetElements.querySelectorAll('[data-render-widget]');
	} else if (widgetElements instanceof NodeList || Array.isArray(widgetElements)) {
		widgets = widgetElements;
	} else {
		console.warn('renderWidgets: Invalid widgetElements parameter');
		return;
	}

	// Обработка tippy элементов (если передан родительский элемент)
	if (widgetElements instanceof HTMLElement) {
		const tippys = widgetElements.querySelectorAll('[data-render-tippy]');

		if (tippys.length) {
			tippys.forEach(el => {
				const [name, type] = el.getAttribute('data-render-tippy').split(',');
				const { start_date, end_date } = queryParams;

				const hasCustom = el.hasAttribute('custom');
				let newContent = '';

				if (hasCustom) {
					newContent = `
					<div class="border border-solid border-[#005c9e] rounded p-1.5" style="background: rgba(0, 92, 158, 0.15);">
						<div class="text-xs text-[#005c9e] leading-[100%]">
							С учетом переплат <br> за 4 дня след. месяца
						</div>
						<div class="text-lg text-[#1c2434] font-bold">${formattingPrice(data[name] || 0)}</div>
					</div>
					`;
				} else {
					newContent = `<span class="tippy-info-span tippy-info-date">
        ${type == 'start'
							? `${dateFormatter(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-1`))} - ${dateFormatter(end_date)}`
							: `${dateFormatter(start_date)} - ${dateFormatter(end_date)}`
						}
        </span>`;
				}

				if (el._tippy) {
					el._tippy.setContent(newContent);
				} else {
					tippy(el, {
						content: newContent,
						trigger: 'mouseenter',
						offset: [0, 0],
						placement: 'top-start',
						arrow: true,
						interactive: false
					});
				}
			});
		}

		// Обработка элементов с date-range
		if (defaultDate) {
			const dateRange = widgetElements.querySelectorAll('[date-range]');
			dateRange.length &&
				dateRange.forEach(el => {
					el.textContent = `${dateFormatter(defaultDate[0], 'dd MMMM yyyy')} - ${dateFormatter(defaultDate[1], 'dd MMMM yyyy')}`;
				});
		}
	}

	if (!widgets.length) return;

	widgets.forEach(widget => {
		const params = widget.getAttribute('data-render-widget');
		if (!params) return;

		const hasPrice = widget.hasAttribute('price');
		const hasPrice2 = widget.hasAttribute('price2');
		const hasArea = widget.hasAttribute('area');
		const condition = widget.getAttribute('data-condition');
		// Проверяем, нужно ли устанавливать ширину
		const widthAttr = widget.hasAttribute('data-width');

		const calculatedValue = calculateExpression(params, data);

		function formatOutput(value) {
			let str = Number.isInteger(value) ? value : value.toFixed(2);
			if (hasPrice) {
				str = formattingPrice(str);
			} else if (hasArea) {
				str = str + ' м²';
			}
			return str;
		}

		function checkCondition(condition, data) {
			if (!condition) return null;

			// Парсим условие: key1>=key2, key1>key2, key1<=key2, key1<key2, key1==key2
			const match = condition.match(/^(.+?)(>=|<=|>|<|==?)(.+)$/);
			if (!match) return null;

			const leftKey = match[1].trim();
			const operator = match[2];
			const rightKey = match[3].trim();

			const leftValue = parseFloat(data[leftKey]);
			const rightValue = parseFloat(data[rightKey]);

			if (isNaN(leftValue) || isNaN(rightValue)) return null;

			// Всегда сначала проверяем на равенство
			if (leftValue === rightValue) return 'equal';

			// Затем проверяем условие
			switch (operator) {
				case '>':
					return leftValue > rightValue ? 'success' : 'fail';
				case '<':
					return leftValue < rightValue ? 'success' : 'fail';
				case '>=':
					return leftValue >= rightValue ? 'success' : 'fail';
				case '<=':
					return leftValue <= rightValue ? 'success' : 'fail';
				case '=':
				case '==':
					return 'fail'; // уже проверили на равенство выше
				default:
					return null;
			}
		}

		function applyColor(widget, condition, data) {
			const result = checkCondition(condition, data);
			if (result === 'equal') {
				widget.style.color = '#ffc107'; // желтый
			} else if (result === 'success') {
				widget.style.color = '#37b456'; // зеленый
			} else if (result === 'fail') {
				widget.style.color = '#fe0334'; // красный
			}
		}

		if (calculatedValue !== null) {
			widget.innerText = formatOutput(calculatedValue);

			if (widthAttr) {
				widget.style.setProperty('--width', `${calculatedValue}%`);
			}

			if (condition) {
				applyColor(widget, condition, data);
			}
			return;
		}

		// Обычное значение с опциональным суффиксом: "key" или "key,suffix"
		const [key, suffix = ''] = params.split(',');
		const value = data?.[key] || 0;

		if (value === null || value === undefined) return;

		if (hasPrice) {
			const num = parseFloat(value);
			widget.innerText = Number.isInteger(num) ? formattingPrice(num) : '';
		} else if (hasPrice2) {
			widget.innerText = formattingPrice(parseFloat(value)) + suffix;
		} else {
			widget.innerHTML = value + suffix;
		}

		if (widthAttr) {
			widget.style.setProperty('--width', `${value}%`);
			widget.innerHTML = ''
		}

		if (condition) {
			applyColor(widget, condition, data);
		}
	});
}
