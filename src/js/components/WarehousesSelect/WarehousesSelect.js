import { Select } from "../../modules/mySelect.js"
import { getWarehousesInfo } from "../../settings/request.js"

class WarehousesSelect {
  constructor() {
    this.select = document.querySelector('[data-special-select="warehouse-select"]')
    this.selectCustom = new Select({
      uniqueName: 'warehouse-select',
      onChange: this.onChange.bind(this),
      callbackInput: value => {
        return `<img src="./img/svg/warehouse.svg" alt="Склад" width="20" height="20"><span style="flex: 1 1 auto">${value}</span><svg class='icon icon-arrow'><use xlink:href='img/svg/sprite.svg#arrow'></use></svg>`
      },
    })

    this.mainLoader = document.querySelector('.body-loader')
    this.warehouseStorage = JSON.parse(sessionStorage.getItem('warehouse'))

    this.warehouses = []
  }

  enableLoader() {
    this.mainLoader.classList.add('_load')
  }

  disableLoader() {
    this.mainLoader.classList.remove('_load')
  }

  onChange(e, select, optionValue) {
    const [currentWarehouse] = this.warehouses.filter(warehouse => warehouse.warehouse_id === +optionValue)
    this.setStorageWarehouse(currentWarehouse)
    location.reload()
  }

  getStorageWarehouse() {
    this.warehouseStorage = JSON.parse(sessionStorage.getItem('warehouse'))
    return this.warehouseStorage
  }

  setStorageWarehouse(warehouse) {
    sessionStorage.setItem('warehouse', JSON.stringify(warehouse))
  }

  async render() {
    try {
      this.enableLoader()
      const { warehouses = [] } = await getWarehousesInfo()
      this.warehouses = warehouses

      if (warehouses.length) {
        const warehouseStorage = this.getStorageWarehouse()

        this.select.innerHTML = warehouses.map(warehouse => `<option value="${warehouse.warehouse_id}">${warehouse.warehouse_name}</option>`).join('')

        let activeIndex = 0;

        if (warehouseStorage) {
          activeIndex = warehouses.findIndex(warehouse => warehouse.warehouse_id === warehouseStorage.warehouse_id) ?? 0
        } else {
          this.setStorageWarehouse(warehouses[activeIndex])
        }

        window.app = { ...window.app, warehouse: warehouses[activeIndex], warehouses }
        this.selectCustom.options.activeIndex = activeIndex
        this.selectCustom.init()

        return warehouses[activeIndex]
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.disableLoader()
    }
  }
}

export default WarehousesSelect