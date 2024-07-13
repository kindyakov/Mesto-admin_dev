import Dashboards from "../Dashboards.js";
import Scheme from "../../../components/Scheme/Scheme.js";
import { getRooms, getWarehousesInfo } from "../../../settings/request.js";
import { Select } from "../../../modules/mySelect.js";
import { FilterRooms } from "../../../components/FilterRooms/FilterRooms.js";

class Forecast extends Dashboards {
  constructor({ loader }) {
    super({ loader, page: 'forecast' });
    this.warehouseScheme = new Scheme()

    this.currentRented = null
  }

  init() {
    if (!this.wrapper) return
    this.selectWarehouseFloors = new Select({ uniqueName: 'select-warehouse-floors', parentEl: this.wrapper })
    this.filterRooms = FilterRooms(this.wrapper.querySelector('.btn-set-filters'))

    this.events()
  }

  events() {
    this.wrapper.addEventListener('click', e => {
      if (e.target.closest('.btn-filter-scheme:not(._active)')) {
        this.handleClickFilterScheme(e)
      }
    })

    this.selectWarehouseFloors.onChange = (e, select, value) => {
      this.warehouseScheme.changeActive(+value)
    }

    this.filterRooms.onApply = filterParams => this.renderScheme(filterParams)
  }

  handleClickFilterScheme(e) {
    const btn = e.target.closest('.btn-filter-scheme')
    const btnActive = this.wrapper.querySelector('.btn-filter-scheme._active')
    const rented = btn.getAttribute('data-rented')

    btn.classList.add('_active')
    btnActive?.classList.remove('_active')

    this.currentRented = rented
    this.warehouseScheme.filterCell(rented)
  }

  async render() {
    try {
      this.loader.enable()
      const [dataWarehouses, dataRooms] = await Promise.all([getWarehousesInfo(), getRooms()])

      if (dataWarehouses) {
        console.log(dataWarehouses)
      }

      if (dataRooms) {
        this.warehouseScheme.render(dataRooms)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async renderScheme(params = {}) {
    try {
      this.loader.enable()
      const data = await getRooms(params)
      if (data) {

        if (this.currentRented) {
          this.warehouseScheme.setNumRooms(data.plan_rooms)
          this.warehouseScheme.filterCell(this.currentRented)
        } else {
          this.warehouseScheme.render(data)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Forecast