import Page from "../Page.js"
import Scheme from "../../components/Scheme/Scheme.js";
import TableRooms from "../../components/Tables/TableRooms/TableRooms.js";
import FilterRooms from "../../components/Filters/FilterRooms/FilterRooms.js";
import SelectRooms from '../../components/SelectRooms/SelectRooms.js';
import { getRooms, getScheme, getMovingOutClients, getNonApprovedClients } from "../../settings/request.js";

import { Select } from "../../modules/mySelect.js";
import { Tabs } from "../../modules/myTabs.js"

import { roomHtml, rowHtml, row2Html } from "./html.js";

function extractNumbers(str) {
  const nonDigitRegex = /\D/g;
  return str.replace(nonDigitRegex, '');
}

class Rooms extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        {
          tableSelector: '.table-rooms',
          TableComponent: TableRooms,
          options: {
            paginationPageSize: 10
          },
          params: {
            getData: getRooms
          }
        }
      ],
      page: 'rooms'
    })

    this.planRooms = []
    this.selectRooms = []
    this.currentRented = null

    this.warehouseScheme = new Scheme(this.wrapper)
    this.filterRooms = new FilterRooms([...this.wrapper.querySelectorAll('.btn-set-filters')])
    this.tabs = new Tabs({
      classBtnActive: '_active',
      classContentActive: '_active',
      specialSelector: '.room-tabs',
      uniqueName: true,
    })
    this.selectRooms = new SelectRooms(this.wrapper)

    this.selectsRoomsContent = this.wrapper.querySelector('.selects-rooms')
    this.formFilterRoom = this.wrapper.querySelector('.form-filter-room')
    this.timerInput = null
    this.inputSearch = this.wrapper.querySelector('.input-table-search')
    this.roomsContent = this.wrapper.querySelector('.rooms')

    this.ready()
  }

  ready() {
    const { num_of_floors } = this.app.warehouse
    const select = this.wrapper.querySelector('select[name="floors"]')
    select.innerHTML = ''

    for (let i = 0; i < num_of_floors; i++) {
      select.insertAdjacentHTML('beforeend', `<option value="${i + 1}">${i + 1} этаж</option>`)
    }

    if (num_of_floors >= 2) {
      this.selectWarehouseFloors = new Select({ uniqueName: 'select-warehouse-floors', parentEl: this.wrapper })
    }

    this.event()
  }

  event() {
    this.wrapper.addEventListener('click', e => {
      if (e.target.closest('.btn-filter-scheme:not(._active)')) {
        this.handleClickFilterScheme(e)
      }
    })

    // Изменение этажа
    if (this.selectWarehouseFloors) {
      this.selectWarehouseFloors.onChange = (e, select, value) => {
        // this.warehouseScheme.changeActive(+value)
        this.changeQueryParams({ floor: +value })
      }
    }

    this.filterRooms.onApply = filterParams => this.changeQueryParams(filterParams)
    this.formFilterRoom.addEventListener('submit', this.handleSubmit.bind(this))
    this.inputSearch.addEventListener('input', this.handleInputSearch.bind(this))
    this.tabs.onChange = ({ nextTabBtn }) => {
      this.formFilterRoom.classList.remove('_none')

      if (nextTabBtn.classList.contains('tab-confirmation')) {
        this.formFilterRoom.classList.add('_none')
        this.renderConfirmation()
      }
    }

  }

  handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    this.changeQueryParams({ search_str: formData.get('search_str') })
  }

  handleInputSearch(e) {
    const input = e.target
    input.value = extractNumbers(input.value)
    clearTimeout(this.timerInput)
    this.timerInput = setTimeout(() => {
      this.changeQueryParams({ search_str: input.value })
    }, 500)
  }

  handleClickFilterScheme(e) {
    const btn = e.target.closest('.btn-filter-scheme')
    const btnActive = this.wrapper.querySelector('.btn-filter-scheme._active')
    const rented = btn.getAttribute('data-rented').split(';')

    btn.classList.add('_active')
    btnActive?.classList.remove('_active')

    this.changeQueryParams({ rented })
  }

  onRender([dataRooms, scheme]) {
    this.roomsContent.innerHTML = ''

    if (dataRooms) {
      const { rooms = [], plan_rooms = [] } = dataRooms

      this.selectRooms.setRooms(plan_rooms)
      this.warehouseScheme.render(scheme, dataRooms)

      if (rooms.length) {
        rooms.forEach(room => {
          this.roomsContent.insertAdjacentHTML('beforeend', roomHtml(room))
        })
      } else {
        this.roomsContent.innerHTML = `<div class="not-room"><span>Нет ячеек для отображения<span></div>`
      }

      // this.warehouseScheme.setNumRooms(dataRooms.plan_rooms)
      // this.warehouseScheme.filterCell(this.currentRented)
    }
  }

  async getData(queryParams = {}) {
    const { warehouse_id = 1, floor = 1 } = queryParams
    return Promise.all([
      getRooms({ show_cnt: this.tables[0].gridOptions.paginationPageSize, ...queryParams }),
      getScheme(warehouse_id, floor)
    ])
  }

  async renderConfirmation() {
    try {
      this.loader.enable()

      const [{ users: usersM = [] }, { users: usersN = [] }] = await Promise.all(
        [
          getMovingOutClients({ warehouse_id: window.app.warehouse.warehouse_id }),
          getNonApprovedClients()
        ]
      )

      const contentConfirmDeparture = this.wrapper.querySelector('.content-confirmation-departure')
      const contentConfirmClient = this.wrapper.querySelector('.content-confirmation-client')

      contentConfirmDeparture.innerHTML = `<div class="not-data"><span>Нет клиентов для отображения<span></div>`
      contentConfirmClient.innerHTML = `<div class="not-data"><span>Нет клиентов для отображения<span></div>`

      if (usersM.length) {
        contentConfirmDeparture.innerHTML = usersM.map(obj => rowHtml(obj)).join('')
      }

      if (usersN.length) {
        contentConfirmClient.innerHTML = usersN.map(obj => row2Html(obj)).join('')
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Rooms