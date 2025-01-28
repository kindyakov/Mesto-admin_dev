import Page from '../Page.js';
import TablePayments from '../../components/Tables/TablePayments/TablePayments.js';
import { getPayments } from '../../settings/request.js';

class Payments extends Page {
	constructor({ loader }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-payments',
					TableComponent: TablePayments,
					options: {
						paginationPageSize: 15
					},
					params: {
						getData: params =>
							getPayments({ warehouse_id: this.app.warehouse.warehouse_id, ...params })
					}
				}
			],
			page: 'payments'
		});
	}

	async getData(queryParams = {}) {
		return getPayments({
			show_cnt: this.tables[0].gridOptions.paginationPageSize,
			warehouse_id: this.app.warehouse.warehouse_id,
			...queryParams
		});
	}
}

export default Payments;
