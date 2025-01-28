import Dashboards from '../Dashboards.js';
import TableClients from '../../../components/Tables/TableClients/TableClients.js';
// import ChartInfluxCustomers from "../../../components/Charts/ChartInfluxCustomers/ChartInfluxCustomers.js";
// import ChartGenderAge from "../../../components/Charts/СhartGenderAge/СhartGenderAge.js";
import { getClients, getDashboardClient, getSalesPlan } from '../../../settings/request.js';

class Clients extends Dashboards {
	constructor({ loader }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-clients',
					TableComponent: TableClients,
					params: { getData: getClients },
					options: {
						paginationPageSize: 15
					}
				}
			],
			// charts: [
			//   { id: 'chart-influx-customers', ChartComponent: ChartInfluxCustomers },
			//   { id: 'chart-gender-age', ChartComponent: ChartGenderAge },
			// ],
			page: 'dashboards/clients'
		});
	}

	async getData(queryParams = {}) {
		return getClients({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams });
	}

	async getDashboardData(queryParams = {}) {
		return Promise.all([
			getDashboardClient({ warehouse_id: this.app.warehouse.warehouse_id, ...queryParams }),
			getSalesPlan({
				month_or_day: 'month',
				warehouse_id: this.app.warehouse.warehouse_id,
				...queryParams
			})
		]);
	}

	onRender(dataDashboard, dataEntities) {
		if (dataDashboard) {
			const [dashboard, salesPlan] = dataDashboard;
			this.renderWidgets(dashboard);
			this.actionsCharts(chart => chart.render(dataDashboard, this.queryParams));
		}
	}
}

export default Clients;
