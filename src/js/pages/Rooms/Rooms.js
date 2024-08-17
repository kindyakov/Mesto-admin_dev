import uniqBy from 'lodash.uniqby'
import Page from "../Page.js"
import Scheme from "../../components/Scheme/Scheme.js";
import TableRooms from "../../components/Tables/TableRooms/TableRooms.js";
import FilterRooms from "../../components/Filters/FilterRooms/FilterRooms.js";
import { getRooms, getMovingOutClients, getNonApprovedClients } from "../../settings/request.js";

import { Select } from "../../modules/mySelect.js";
import { Tabs } from "../../modules/myTabs.js"

import { roomHtml, rowHtml, row2Html } from "./html.js";
import { createElement } from "../../settings/createElement.js";

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
    this.selectWarehouseFloors = new Select({ uniqueName: 'select-warehouse-floors', parentEl: this.wrapper })
    this.filterRooms = new FilterRooms([...this.wrapper.querySelectorAll('.btn-set-filters')])
    this.tabs = new Tabs({
      classBtnActive: '_active',
      classContentActive: '_active',
      specialSelector: '.room-tabs',
      uniqueName: true,
    })

    this.selectsRoomsContent = this.wrapper.querySelector('.selects-rooms')
    this.formFilterRoom = this.wrapper.querySelector('.form-filter-room')
    this.timerInput = null
    this.inputSearch = this.wrapper.querySelector('.input-table-search')
    this.roomsContent = this.wrapper.querySelector('.rooms')

    this.event()
  }

  event() {
    this.wrapper.addEventListener('click', e => {
      if (e.target.closest('.btn-filter-scheme:not(._active)')) {
        this.handleClickFilterScheme(e)
      }
      if (e.target.closest('.warehouse__svg-cell[data-rented]')) {
        this.handleClickCell(e)
      }

      if (e.target.closest('.btn-remove-room')) {
        this.handleClickRemoveRoom(e)
      }
    })

    // Изменение этажа
    this.selectWarehouseFloors.onChange = (e, select, value) => {
      this.warehouseScheme.changeActive(+value)
      this.changeQueryParams({ floor: +value })
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

    window.addEventListener('resize', this.resizeScrollableContent.bind(this))
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
    const rented = btn.getAttribute('data-rented')

    btn.classList.add('_active')
    btnActive?.classList.remove('_active')

    this.changeQueryParams({ rented })
  }

  handleClickCell(e) {
    e.preventDefault()
    const cell = e.target.closest('.warehouse__svg-cell')
    const cellNum = +cell.getAttribute('data-cell-num')
    const [currentRoom] = this.planRooms.filter(room => room.room_id == cellNum)

    if (cell.classList.contains('_selected')) {
      this.changeSelectRooms('remove', currentRoom)
    } else {
      this.changeSelectRooms('add', currentRoom)
    }
  }

  handleClickRemoveRoom(e) {
    const btn = e.target.closest('.btn-remove-room')
    const roomId = +btn.getAttribute('data-room-id')
    const [currentRoom] = this.planRooms.filter(room => room.room_id == roomId)
    this.changeSelectRooms('remove', currentRoom)
  }

  changeSelectRooms(type, room) {
    const renderRooms = () => {
      const html = this.selectRooms.map(_room => roomHtml({ ..._room, remove: true })).join('')
      const div = createElement('div', { classes: ['wrap-scroll'], content: html })
      this.selectsRoomsContent.innerHTML = div.outerHTML
      this.selectsRoomsContent.scrollIntoView({ block: "center", behavior: "smooth" })
      this.resizeScrollableContent()
    }

    const currentCell = this.wrapper.querySelector(`[data-cell-num="${room.room_id}"]`)

    const actions = {
      add: room => {
        this.selectRooms.push(room)
        currentCell.classList.add('_selected')
        renderRooms()
      },
      remove: room => {
        currentCell.classList.remove('_selected')
        this.selectRooms = this.selectRooms.filter(_room => +_room.room_id !== +room.room_id)
        renderRooms()
      }
    }

    actions[type]?.(room)
  }

  resizeScrollableContent() {
    const children = Array.from(this.selectsRoomsContent.querySelectorAll('.room'))
    const maxHeight = children.reduce((max, child) => Math.max(max, child.offsetHeight), 0)
    this.selectsRoomsContent.style.height = (maxHeight + 6) + 'px';
  }

  onRender(dataRooms) {
    this.roomsContent.innerHTML = ''

    if (dataRooms) {
      const { rooms = [], plan_rooms = [] } = dataRooms

      this.planRooms = uniqBy([...this.planRooms, ...plan_rooms], 'room_id')
      this.warehouseScheme.render(dataRooms)

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

  async getData(params = {}) {
    return getRooms(params)
  }

  async renderConfirmation() {
    try {
      this.loader.enable()
      const [{ users: usersM = [] }, { users: usersN = [] }] = await Promise.all([getMovingOutClients(), getNonApprovedClients()])

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