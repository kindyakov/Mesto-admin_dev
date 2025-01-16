import Dashboards from '../Dashboards.js';
import { getDashboardFinance, getIndexations } from '../../../settings/request.js';
import TableIndexation from '../../../components/Tables/TableIndexation/TableIndexation.js';
import TablePricesCells from '../../../components/Tables/TablePricesCells/TablePricesCells.js';

async function getPricesCells() {
	const pricesCells = localStorage.getItem('prices-cells');
	return pricesCells ? JSON.parse(pricesCells) : [];
}

class Indexation extends Dashboards {
	constructor({ loader, navigation }) {
		super({
			loader,
			tables: [
				{
					tableSelector: '.table-indexation',
					TableComponent: TableIndexation,
					options: {
						paginationPageSize: 30
					},
					params: {
						getData: getIndexations
					},
					navigation
				},
				{
					tableSelector: '.table-prices-cells',
					TableComponent: TablePricesCells,
					params: {
						getData: getPricesCells
					},
					navigation
				}
			],
			page: 'dashboards/indexation'
		});

		const inputCheckbox = this.wrapper.querySelector('[name="without-large-cells"]');
		inputCheckbox && inputCheckbox.addEventListener('change', this.handleChangeInput.bind(this));

		const [tableIndexation, tablePricesCells] = this.tables;

		tablePricesCells.onApplyChange = data => {
			let resultData = null;

			data?.length &&
				data.forEach(({ size_start, size_end, size_type, price_1m, price_6m, price_11m }) => {
					resultData = tableIndexation.data.map(obj => {
						if (size_start <= obj[size_type] <= size_end) {
							const rentPrice = () => {
								let price = 0;

								if (obj.rent_period < 6) {
									price = price_1m;
								} else if (6 <= obj.rent_period < 11) {
									price = price_6m;
								} else if (obj.rent_period > 11) {
									price = price_11m;
								}
								return price;
							};

							obj.new_price = obj.rent_period * rentPrice();
						}
						return obj;
					});
				});

			if (resultData) {
				tableIndexation.data = resultData;
				tableIndexation.tableRendering();
			}
		};
	}

	async getData(queryParams = {}) {
		return Promise.all([
			getIndexations({
				warehouse_id: window.app.warehouse.warehouse_id,
				show_cnt: 30,
				...queryParams
			}),
			getPricesCells()
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

	onRender(dataDashboard) {
		// this.renderWidgets(dataDashboard);
	}
}

export default Indexation;
