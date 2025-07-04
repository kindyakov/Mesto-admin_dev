import Dashboards from '../Dashboards.js';
import TableUpcomingPayments from '../../../components/Tables/TableUpcomingPayments/TableUpcomingPayments.js';
import ChartRevenue from '../../../components/Charts/ChartRevenue/ChartRevenue.js';
import {
	getDashboardFinance,
	getFinancePlan,
	postFuturePayments
} from '../../../settings/request.js';
import { formattingPrice } from '../../../utils/formattingPrice.js';

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
			charts: [{ id: 'chart-revenue', ChartComponent: ChartRevenue }],
			page: 'dashboards/finance'
		});

		this.actionsCharts(chart => {
			chart.loader = this.loader;
			chart.app = this.app;
		});

		const inputCheckbox = this.wrapper.querySelector('[name="without-large-cells"]');
		inputCheckbox && inputCheckbox.addEventListener('change', this.handleChangeInput.bind(this));
	}

	async getData(queryParams = {}) {
		return postFuturePayments({
			warehouse_id: this.app.warehouse.warehouse_id,
			show_cnt: 1000,
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
			getFinancePlan({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams })
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
		remainsDeposit.style.width = `calc(${findPercentageOfTotal(remainsDepositV, sum)}% + 30px)`;

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

	onRender([dataDashboard, { finance_planfact = [] }], dataEntities) {
		this.renderWidgets(dataDashboard);

		if (this.tables.length && dataEntities) {
			this.actionsTables((table, i) => {
				table.data = dataEntities.agreements;
				table.onRendering(Array.isArray(dataEntities) ? dataEntities[i] : dataEntities);
			});
		}

		this.visualization({ dataDashboard, finance_planfact, dataEntities });
	}
}

export default Finance;
