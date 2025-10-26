import { Parser } from 'expr-eval';
import Page from '../Page.js';
import { Select } from '../../modules/mySelect.js';
import { createCalendar } from '../../settings/createCalendar.js';
import { dateFormatter } from '../../settings/dateFormatter.js';
import tippy from '../../configs/tippy.js';
import { formattingPrice } from '../../utils/formattingPrice.js';
// import { inputValidator } from "../../settings/validates.js";

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

class Dashboards extends Page {
	constructor(options) {
		super(options);

		this.formFilter = this.wrapper.querySelector('.form-filter-dashboards');
		this.widgets = this.wrapper.querySelectorAll('[data-render-widget]');

		if (this.formFilter) {

			this.selectFilter = new Select({
				uniqueName: 'select-filter-main',
				parentEl: this.wrapper
			});
			this.calendars = createCalendar(`[data-content="${options.page}"] .input-date-filter`, {
				mode: 'range',
				dateFormat: 'd. M, Y',
				defaultDate: this.app.defaultDate,
				onChange: (selectedDates, dateStr, instance) => {
					if (selectedDates.length === 2) {
						this.app.defaultDate = selectedDates;
						this.changeQueryParams({
							start_date: dateFormatter(selectedDates[0], 'yyyy-MM-dd'),
							end_date: dateFormatter(selectedDates[1], 'yyyy-MM-dd')
						});
					}
				}
			});

			this.inputsFilter = this.wrapper.querySelectorAll('.input-filter');

			this.inputsFilter.length &&
				this.inputsFilter.forEach(input => {
					let timer;
					input.addEventListener('input', () => {
						clearTimeout(timer);
						timer = setTimeout(() => {
							this.changeQueryParams({ [input.name]: input.value });
						}, 600);
					});
				});

			this.queryParams = {
				start_date: dateFormatter(this.calendars.selectedDates[0], 'yyyy-MM-dd'),
				end_date: dateFormatter(this.calendars.selectedDates[1], 'yyyy-MM-dd')
			};
		}

		if (this.selectFilter) {
			this.selectFilter.onChange = (e, select, optionValue) => {
				const name = select.getAttribute('data-name');
				const data = { [name]: optionValue };
				this.changeQueryParams(data);
			};
		}

		this.wrapper.addEventListener('click', e => {
			const el = e.target.closest('[scroll-to]');
			if (el) {
				const [selector, params] = el.getAttribute('scroll-to').split(';');
				const toEl = this.wrapper.querySelector(selector);
				if (toEl) {
					toEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
					this.onHandleScrollTo({ el, toEl, params });
				}
			}
		});
	}

	subtractMonths(date, months) {
		const newDate = new Date(date);
		newDate.setMonth(newDate.getMonth() - months);

		return newDate;
	}

	renderWidgets(data) {
		this.widgets = this.wrapper.querySelectorAll('[data-render-widget]');
		const tippys = this.wrapper.querySelectorAll('[data-render-tippy]');
		const dateRange = this.wrapper.querySelectorAll('[date-range]');

		if (tippys.length) {
			tippys.forEach(el => {
				const [name, type] = el.getAttribute('data-render-tippy').split(',');
				const { start_date, end_date } = this.queryParams;

				const newContent = `<span class="tippy-info-span tippy-info-date">
        ${type == 'start'
						? `${dateFormatter(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-1`))} - ${dateFormatter(end_date)}`
						: `${dateFormatter(start_date)} - ${dateFormatter(end_date)}`
					}
        </span>`;

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

		dateRange.length &&
			dateRange.forEach(el => {
				el.textContent = `${dateFormatter(this.app.defaultDate[0], 'dd MMMM yyyy')} - ${dateFormatter(this.app.defaultDate[1], 'dd MMMM yyyy')}`;
			});

		if (!this.widgets.length) return;
		this.widgets.forEach(widget => {
			const params = widget.getAttribute('data-render-widget');
			if (!params) return;

			const hasPrice = widget.hasAttribute('price');
			const hasPrice2 = widget.hasAttribute('price2');

			const calculatedValue = calculateExpression(params, data);

			if (calculatedValue !== null) {
				widget.innerText = formattingPrice(calculatedValue);
				return;
			}

			// Обычное значение с опциональным суффиксом: "key" или "key,suffix"
			const [key, suffix = ''] = params.split(',');
			const value = data[key];

			if (value === null || value === undefined) return;

			if (hasPrice) {
				const num = parseFloat(value);
				widget.innerText = Number.isInteger(num) ? formattingPrice(num) : '';
			} else if (hasPrice2) {
				widget.innerText = formattingPrice(parseFloat(value)) + suffix;
			} else {
				widget.innerHTML = value + suffix;
			}
		});
	}

	onHandleScrollTo() { }

	onRender() { }

	getDashboardData() {
		return [];
	}

	async render(queryParams = {}) {
		try {
			this.loader.enable();
			const [dataDashboard = null, dataEntities = null] = await Promise.all([
				this.getDashboardData({ ...this.queryParams, ...queryParams }),
				this.getData(queryParams)
			]);

			if (dataDashboard) {
				this.renderWidgets(dataDashboard);
				this.actionsCharts(chart => chart.render(dataDashboard));
			}

			if (this.tables.length && dataEntities) {
				this.actionsTables((table, i) =>
					table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities)
				);
			}

			if (this.calendars && this.app.defaultDate) {
				this.calendars.setDate(this.app.defaultDate);
			}

			this.onRender(dataDashboard, dataEntities);
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			this.loader.disable();
		}
	}
}

export default Dashboards;
