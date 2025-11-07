import Page from '../Page.js';
import { Select } from '../../modules/mySelect.js';
import { createCalendar } from '../../settings/createCalendar.js';
import { dateFormatter } from '../../settings/dateFormatter.js';
import { renderWidgets as renderWidgetsUtil } from '../../utils/renderWidgets.js';
// import { inputValidator } from "../../settings/validates.js";

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
		renderWidgetsUtil(data, this.wrapper, this.queryParams, this.app.defaultDate);
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
