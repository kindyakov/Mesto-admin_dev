import Page from "../Page.js"
import Scheme from "../../components/Scheme/Scheme.js";
import FilterRooms from "../../components/Filters/FilterRooms/FilterRooms.js";
import SelectRooms from "../../components/SelectRooms/SelectRooms.js";
import { getRooms, getScheme } from "../../settings/request.js";
import { Select } from "../../modules/mySelect.js";

class Warehouse extends Page {
  constructor({ loader }) {
    super({
      loader,
      page: 'warehouse',
    });

    this.warehouseScheme = new Scheme(this.wrapper)
    this.selectRooms = new SelectRooms(this.wrapper)
    this.currentScheme = null
  }

  init() {
    if (!this.wrapper) return
    this.filterRooms = new FilterRooms(this.wrapper.querySelector('.btn-set-filters'))

    const { num_of_floors } = this.app.warehouse
    const select = this.wrapper.querySelector('select[name="floors"]')
    select.innerHTML = ''

    for (let i = 0; i < num_of_floors; i++) {
      select.insertAdjacentHTML('beforeend', `<option value="${i + 1}">${i + 1} этаж</option>`)
    }

    if (num_of_floors >= 2) {
      this.selectWarehouseFloors = new Select({ uniqueName: 'select-warehouse-floors', parentEl: this.wrapper })
    }

    this.events()
  }

  events() {
    if (this.selectWarehouseFloors) {
      this.selectWarehouseFloors.onChange = (e, select, value) => {
        this.changeQueryParams({ floor: +value })
      }
    }

    this.filterRooms.onApply = filterParams => this.renderScheme(filterParams)
  }

  async getData(queryParams = {}) {
    const { warehouse_id = this.app.warehouse.warehouse_id, floor = 1 } = queryParams
    return Promise.all([
      getRooms(queryParams),
      getScheme(warehouse_id, floor)
    ])
  }

  onRender([dataRooms, scheme]) {
    this.currentScheme = scheme
    if (dataRooms) {
      this.selectRooms.setRooms(dataRooms.plan_rooms)
      this.warehouseScheme.render(scheme, dataRooms)
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
          this.warehouseScheme.render(this.currentScheme, data)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Warehouse