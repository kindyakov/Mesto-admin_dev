import Dashboards from '../Dashboards.js';
import TableSalesChannels from '../../../components/Tables/TableSalesChannels/TableSalesChannels.js';
import TableSalesChannelsEdit from '../../../components/Tables/TableSalesChannelsEdit/TableSalesChannelsEdit.js';
import ChartSalesChannels from '../../../components/Charts/ChartSalesChannels/ChartSalesChannels.js';
import {
	getSaleChannelsExpenses,
	getSaleChannelsStats,
	getSaleChannelsLeads,
	getSalesPlan
} from '../../../settings/request.js';
import { dateFormatter, subtractMonths } from '../../../settings/dateFormatter.js';

class SalesChannels extends Dashboards {
	constructor({ loader }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-sales-channels-edit',
					TableComponent: TableSalesChannelsEdit,
					params: {
						getData: getSaleChannelsExpenses
					}
				},
				{
					tableSelector: '.table-sales-channels',
					TableComponent: TableSalesChannels,
					params: {
						getData: getSaleChannelsStats
					}
				}
			],
			charts: [{ id: 'chart-sales-channels', ChartComponent: ChartSalesChannels }],
			page: 'dashboards/sales-channels'
		});

		this.tables[1].onReadyFunctions.push(function name(context) {
			context.calendar.setDate([subtractMonths(new Date(), 2), new Date()]);
		});
	}

	async getData(queryParams = {}) {
		return Promise.all([getSaleChannelsExpenses(queryParams), getSaleChannelsStats(queryParams)]);
	}

	async getDashboardData(queryParams = {}) {
		return Promise.all([
			getSaleChannelsLeads({
				start_date: dateFormatter(this.subtractMonths(new Date(), 2), 'yyyy-MM-dd'),
				end_date: dateFormatter(new Date(), 'yyyy-MM-dd'),
				...queryParams
			}),
			getSalesPlan({
				start_date: dateFormatter(this.subtractMonths(new Date(), 2), 'yyyy-MM-dd'),
				end_date: dateFormatter(new Date(), 'yyyy-MM-dd'),
				warehouse_id: this.app.warehouse.warehouse_id,

				...queryParams
			})
		]);
	}
}

export default SalesChannels;
