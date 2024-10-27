import uniqBy from 'lodash.uniqby'
import { createElement } from "../../settings/createElement.js"
import { roomHtml } from "../../pages/Rooms/html.js"

class SelectRooms {
  constructor(wrapper) {
    this.wrapper = wrapper
    this.selectsRoomsContent = wrapper.querySelector('.selects-rooms')

    this.planRooms = []
    this.selectRooms = []

    wrapper.addEventListener('click', e => {
      if (e.target.closest('.warehouse__svg-cell[data-rented]')) {
        this.handleClickCell(e)
      }

      if (e.target.closest('.btn-remove-room')) {
        this.handleClickRemoveRoom(e)
      }
    })

    window.addEventListener('resize', this.resizeScrollableContent.bind(this))
  }

  setRooms(rooms) {
    this.planRooms = uniqBy([...this.planRooms, ...rooms], 'room_name')
  }

  handleClickCell(e) {
    e.preventDefault()
    const cell = e.target.closest('.warehouse__svg-cell')
    const cellNum = +cell.getAttribute('data-cell-num')
    const [currentRoom] = this.planRooms.filter(room => room.room_name == cellNum)

    if (cell.classList.contains('_selected')) {
      this.changeSelectRooms('remove', currentRoom)
    } else {
      this.changeSelectRooms('add', currentRoom)
    }
  }

  handleClickRemoveRoom(e) {
    const btn = e.target.closest('.btn-remove-room')
    const roomId = +btn.getAttribute('data-room-id')
    const [currentRoom] = this.planRooms.filter(room => room.room_name == roomId)
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

    const currentCell = this.wrapper.querySelector(`[data-cell-num="${room.room_name}"]`)

    const actions = {
      add: room => {
        this.selectRooms.unshift(room)
        currentCell.classList.add('_selected')
        renderRooms()
      },
      remove: room => {
        currentCell.classList.remove('_selected')
        this.selectRooms = this.selectRooms.filter(_room => +_room.room_name !== +room.room_name)
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

  resizeScrollableContent() {
    const children = Array.from(this.selectsRoomsContent.querySelectorAll('.room'))
    const maxHeight = children.reduce((max, child) => Math.max(max, child.offsetHeight), 0)
    this.selectsRoomsContent.style.height = (maxHeight + 6) + 'px';
  }
}

export default SelectRooms