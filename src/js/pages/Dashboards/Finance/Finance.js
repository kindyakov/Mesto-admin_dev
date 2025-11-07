import Dashboards from '../Dashboards.js';
import TableUpcomingPayments from '../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js';
import RentDynamics from '../../../components/Charts/RentDynamics.js';
import PaymentStructure from '../../../components/Charts/PaymentStructure.js';
import DynamicsAvgRate from '../../../components/Charts/DynamicsAvgRate.js';
import ChartRevenue from '../../../components/Charts/ChartRevenue/ChartRevenue.js';
import {
	getDashboardFinance,
	getFinancePlan,
	postFuturePayments
} from '../../../settings/request.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';
import { mergeQueryParams } from '../../../utils/buildQueryParams.js';
import { getPreviousMonthsRanges } from '../../../utils/getPreviousMonthsRanges.js';

class Finance extends Dashboards {
	constructor({ loader }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-payments',
					TableComponent: TableUpcomingPayments,
					options: {
						paginationPageSize: 1000
					},
					params: {
						getData: postFuturePayments
					}
				}
			],
			charts: [
				{ id: 'chart-rent-dynamics', ChartComponent: RentDynamics },
				{ id: 'chart-payment-structure', ChartComponent: PaymentStructure },
				{ id: 'chart-dynamics-avg-rate', ChartComponent: DynamicsAvgRate },
				{ id: 'chart-revenue', ChartComponent: ChartRevenue }
			],
			page: 'dashboards/finance'
		});

		this.actionsCharts(chart => {
			chart.loader = this.loader;
			chart.app = this.app;
			chart.queryParams = this.queryParams;
		});

		const inputCheckbox = this.wrapper.querySelector('[name="without-large-cells"]');
		inputCheckbox && inputCheckbox.addEventListener('change', this.handleChangeInput.bind(this));
	}

	async getPreviousMonthsData(monthsCount) {
		const currentStartDate = this.queryParams.start_date;
		const currentEndDate = this.queryParams.end_date;

		// Получаем диапазоны для предыдущих месяцев
		const previousRanges = getPreviousMonthsRanges(currentStartDate, currentEndDate, monthsCount).reverse();

		// Формируем массив всех запросов
		const requests = [
			// Основной запрос (текущий период)
			getDashboardFinance({
				warehouse_id: this.app.warehouse.warehouse_id,
				end_date: currentEndDate || "",
				start_date: currentStartDate || ""
			}),
			// Запросы за предыдущие месяцы
			...previousRanges.map(range =>
				getDashboardFinance({
					warehouse_id: this.app.warehouse.warehouse_id,
					start_date: range.start_date,
					end_date: range.end_date
				})
			)
		];

		// Выполняем все запросы параллельно
		const data = await Promise.all(requests);

		return {
			previousRanges,
			data,
			currentRange: { start_date: currentStartDate, end_date: currentEndDate }
		};
	}

	async getData(queryParams = {}) {
		this.table.queryParams = mergeQueryParams(this.table.queryParams, queryParams)
		return postFuturePayments({
			warehouse_id: this.app.warehouse.warehouse_id,
			show_cnt: 1000,
			show_what: this.table?.queryParams?.show_what || 'reestr',
			...queryParams
		});
	}

	async getDashboardData(queryParams = {}) {
		return Promise.all([
			getDashboardFinance({
				warehouse_id: this.app.warehouse.warehouse_id,
				...this.queryParams,
				...queryParams
			}),
			getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams }),
			this.getPreviousMonthsData(9)
		]);
	}

	handleChangeInput({ target }) {
		const [inputStartArea, inputEndArea] = Array.from(this.inputsFilter).map(input => {
			if (['start_area', 'end_area'].includes(input.name)) {
				return input;
			}
		});

		let attrName = 'data-old-value';

		let oldStartAreaV = inputStartArea.getAttribute(attrName) || inputStartArea.value;
		let oldEndAreaV = inputEndArea.getAttribute(attrName) || inputEndArea.value;

		if (target.checked) {
			inputStartArea.setAttribute(attrName, inputStartArea.value);
			inputEndArea.setAttribute(attrName, inputEndArea.value);

			inputStartArea.value = 0;
			inputEndArea.value = 40;
		} else {
			inputStartArea.value = oldStartAreaV;
			inputEndArea.value = oldEndAreaV;
		}

		this.changeQueryParams({
			start_area: inputStartArea.value,
			end_area: inputEndArea.value
		});
	}

	onHandleScrollTo({ params }) {
		const [table] = this.tables;
		if (!params) return;

		params = JSON.parse(params);
		params.warehouse_id = window.app.warehouse.warehouse_id
		table.selects.setValue(params.show_what)
		table.updateQueryParams(params);
	}

	visualization({ dataDashboard, finance_planfact, dataEntities }) {
		const visualization = this.wrapper.querySelector('.visualization');
		const fact = this.wrapper.querySelector('.visualization-fact');
		const remainsDeposit = this.wrapper.querySelector('.visualization-remains-deposit');
		const differenceFactPlan = this.wrapper.querySelector('.difference-fact-plan');
		const needsCollectedMont = this.wrapper.querySelector('.needs-collected-mont');

		const [currentD] = finance_planfact.filter(
			obj => new Date(obj.data).toDateString() == new Date().toDateString()
		);
		const data = currentD ? currentD : finance_planfact.at(-1);

		const factV = data.revenue_reestr_accumulated || 0;
		const planV = data.reest_plan_accumulated;
		const needsCollectedMontV = dataDashboard.reestr_sum || 0;
		const remainsDepositV = needsCollectedMontV - factV;
		const sum = factV + remainsDepositV;

		differenceFactPlan.textContent = formattingPrice(dataDashboard.debitors);
		needsCollectedMont.textContent = formattingPrice(needsCollectedMontV);
		fact.textContent = formattingPrice(factV);
		remainsDeposit.textContent = formattingPrice(remainsDepositV);

		function findPercentageOfTotal(part, total) {
			return (part / total) * 100;
		}

		fact.style.width = `${findPercentageOfTotal(factV, sum)}%`;
		remainsDeposit.style.width = `calc(${findPercentageOfTotal(remainsDepositV, sum)}% + 15px)`;

		differenceFactPlan.style.left = `${findPercentageOfTotal(factV, sum) / 2}%`;
		remainsDeposit.style.left = `${findPercentageOfTotal(factV, sum)}%`;

		differenceFactPlan.classList.remove('text-error');
		differenceFactPlan.classList.remove('text-success');

		if (dataDashboard.debitors <= 0) {
			this.wrapper.querySelector('._circle.debitors').style.color = '#e03d3d';
			differenceFactPlan.classList.add('text-error');
		} else {
			this.wrapper.querySelector('._circle.debitors').style.color = '#0b704e';
			differenceFactPlan.classList.add('text-success');
		}
	}

	onRender([dataDashboard, { finance_planfact = [] }, previousMonthsData], dataEntities) {
		let todayFinancePlanFact = {}

		if (finance_planfact.length) {
			const today = new Date().toISOString().split('T')[0];
			const startDate = new Date(this.queryParams.start_date);
			const endDate = new Date(this.queryParams.end_date);
			const currentDate = new Date(today);

			console.log(finance_planfact.at(-1))

			todayFinancePlanFact = finance_planfact.at(-1)

			if (currentDate >= startDate && currentDate <= endDate) {
				todayFinancePlanFact = finance_planfact.find(item => item.data === today)
			}
		}


		this.renderWidgets({ ...todayFinancePlanFact, ...dataDashboard });

		if (this.tables.length && dataEntities) {
			this.actionsTables((table, i) => {
				table.data = dataEntities.agreements;
				table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities);
				table.queryParams = {
					...table.queryParams, end_date: this.queryParams.end_date, start_date: this.queryParams.start_date
				}
			});
		}

		// Передаем данные в диаграммы
		if (this.charts.length) {
			this.actionsCharts((chart) => {
				// Передаем полные данные, каждая диаграмма сама возьмет нужное количество
				chart.previousMonthsData = previousMonthsData;
				chart.render([dataDashboard, { finance_planfact }]);
			});
		}

		this.visualization({ dataDashboard, finance_planfact, dataEntities });

		const total_reestr_percent = this.wrapper.querySelector('.total-reestr-percent')

		if (total_reestr_percent) {
			const total_reestr_percent_value = (((dataDashboard.total_reestr || 1) / (previousMonthsData.data.at(-1).total_reestr || 1) - 1) * 100).toFixed(0)

			total_reestr_percent.textContent = total_reestr_percent_value + '%'

			if (total_reestr_percent_value > 0) {
				total_reestr_percent.style.color = '#5fc057'
			} else if (total_reestr_percent_value === 0) {
				total_reestr_percent.style.color = '#EFBB34'
			} else {
				total_reestr_percent.style.color = '#E03D3D'
			}
		}
	}
}

export default Finance;
