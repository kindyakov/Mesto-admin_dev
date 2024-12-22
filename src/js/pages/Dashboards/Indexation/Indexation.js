import Dashboards from '../Dashboards.js';
import { getDashboardFinance, getIndexations } from '../../../settings/request.js';
import TableIndexation from '../../../components/Tables/TableIndexation/TableIndexation.js';

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
				}
			],
			page: 'dashboards/indexation'
		});

		const inputCheckbox = this.wrapper.querySelector('[name="without-large-cells"]');
		inputCheckbox && inputCheckbox.addEventListener('change', this.handleChangeInput.bind(this));
	}

	async getData(queryParams = {}) {
		return getIndexations({
			warehouse_id: window.app.warehouse.warehouse_id,
			show_cnt: 30,
			...queryParams
		});
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
		this.renderWidgets(dataDashboard);
	}
}

export default Indexation;
