import { Select } from '../../modules/mySelect.js';
import { getWarehousesInfo } from '../../settings/request.js';

class WarehousesSelect {
	constructor({ mainLoader }) {
		this.select = document.querySelector('[data-special-select="warehouse-select"]');
		this.selectCustom = new Select({
			uniqueName: 'warehouse-select',
			onChange: this.onChange.bind(this),
			callbackInput: value => {
				return `<img src="./img/svg/warehouse.svg" alt="Склад" width="20" height="20"><span style="flex: 1 1 auto">${value}</span><svg class='icon icon-arrow'><use xlink:href='#arrow'></use></svg>`;
			}
		});

		this.mainLoader = mainLoader || document.querySelector('.body-loader');
		this.warehouseStorage = this.getStorageWarehouse();

		this.warehouses = [];
	}

	enableLoader() {
		this.mainLoader.classList.add('_load');
	}

	disableLoader() {
		this.mainLoader.classList.remove('_load');
	}

	onChange(e, select, optionValue) {
		const [currentWarehouse] = this.warehouses.filter(
			warehouse => warehouse.warehouse_id === +optionValue
		);

		this.setStorageWarehouse(currentWarehouse || { warehouse_id: +optionValue });
		location.reload();
	}

	getStorageWarehouse() {
		return JSON.parse(localStorage.getItem('warehouse') || null);
	}

	setStorageWarehouse(warehouse) {
		localStorage.setItem('warehouse', JSON.stringify(warehouse));
	}

	generateWarehouseOptions(warehouses) {
		return warehouses
			.map(wh => `<option value="${wh.warehouse_id}">${wh.warehouse_name}</option>`)
			.join('');
	}

	initSelectCustom(activeIndex) {
		this.selectCustom.init();
		this.selectCustom.setValue(this.warehouses[activeIndex].warehouse_id);
	}

	setupWarehouseSelection(warehouses) {
		const warehouseStorage = this.getStorageWarehouse();

		this.select.innerHTML = this.generateWarehouseOptions(warehouses);

		let activeIndex = warehouseStorage
			? warehouses.findIndex(wh => wh.warehouse_id === warehouseStorage.warehouse_id) ?? 0
			: 0;

		if (!warehouseStorage) {
			this.setStorageWarehouse(warehouses[activeIndex]);
		}

		window.app = { ...window.app, warehouse: warehouses[activeIndex], warehouses };
		return activeIndex;
	}

	async render() {
		try {
			this.enableLoader();
			const { warehouses = [] } = await getWarehousesInfo();
			this.warehouses = warehouses;

			if (warehouses.length) {
				warehouses.push({ warehouse_id: 0, warehouse_name: 'Все склады' });
				const activeIndex = this.setupWarehouseSelection(warehouses);
				this.initSelectCustom(activeIndex);
				return warehouses[activeIndex];
			}
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			this.disableLoader();
		}
	}
}

export default WarehousesSelect;
