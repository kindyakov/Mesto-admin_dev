import Dashboards from "../Dashboards.js";
import Scheme from "../../../components/Scheme/Scheme.js";
import ChartAreaRentedCells from "../../../components/Charts/ChartAreaRentedCells/ChartAreaRentedCells.js";
import ChartCellOccupancy from "../../../components/Charts/ChartCellOccupancy/ChartCellOccupancy.js";
import FilterRooms from "../../../components/Filters/FilterRooms/FilterRooms.js";
import { getRooms, getScheme, getDashboardWarehouse, getFinancePlan } from "../../../settings/request.js";
import { Select } from "../../../modules/mySelect.js";

class Warehouse extends Dashboards {
  constructor({ loader }) {
    super({
      loader, page: 'dashboards/warehouse',
      charts: [
        { id: 'chart-area-rented-cells', ChartComponent: ChartAreaRentedCells },
        { id: 'chart-cell-occupancy', ChartComponent: ChartCellOccupancy },
      ],
    });

    this.warehouseScheme = new Scheme(this.wrapper)

    this.currentRented = null
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
    this.wrapper.addEventListener('click', e => {
      if (e.target.closest('.btn-filter-scheme:not(._active)')) {
        this.handleClickFilterScheme(e)
      }
    })

    if (this.selectWarehouseFloors) {
      this.selectWarehouseFloors.onChange = (e, select, value) => {
        this.changeQueryParams({ floor: +value })
      }
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

  renderWidgets(data) {
    if (!this.widgets.length) return
    this.widgets.forEach(widget => {
      const { rented_cnt } = data
      const [rented, str] = widget.getAttribute('data-render-widget').split(',')
      const [currentData = null] = rented_cnt.filter(obj => +obj.rented === +rented)
      widget.innerText = currentData ? `${currentData.rate}% (${currentData.cnt}, ${+currentData.area.toFixed(1)} м²)` : '0% (0)'
    });
  }

  async getData(queryParams = {}) {
    const { warehouse_id = 1, floor = 1 } = queryParams
    return Promise.all([
      getRooms(queryParams),
      getScheme(warehouse_id, floor)
    ])
  }

  async render() {
    try {
      this.loader.enable()
      const [dataDashboard, { finance_planfact = [] }, [dataRooms, scheme]] = await Promise.all([
        getDashboardWarehouse(), getFinancePlan(),
        this.getData(this.queryParams)
      ])

      dataDashboard.finance_planfact = finance_planfact
      this.renderWidgets(dataDashboard)
      this.actionsCharts(chart => chart.render(dataDashboard))

      if (dataRooms) {
        this.warehouseScheme.render(scheme, dataRooms)
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

export default Warehouse