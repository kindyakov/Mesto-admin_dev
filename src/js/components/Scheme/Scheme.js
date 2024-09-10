class Scheme {
  constructor(wrapper) {
    this.wrapper = wrapper
    this.wrapScheme = wrapper.querySelector('.wrap-scheme')
    this.schemes = wrapper.querySelectorAll('.scheme')

    this.numRooms = {}

    this.init()
  }

  init() {

  }

  changeActive(floor) {
    this.schemes.forEach((scheme, i) => {
      const wrap = scheme.closest('.wrap-scheme')
      if (floor - 1 === i) {
        wrap.classList.add('_active')
      } else {
        wrap.classList.remove('_active')
      }
    })
  }

  filterCell(rented) {
    this.actionsCell(({ cell, cellId }) => {
      const roomRented = this.numRooms[cellId]?.rented

      if (roomRented === undefined) {
        cell.removeAttribute('data-rented')
        return
      }

      if (+rented === -1) {
        cell.setAttribute('data-rented', roomRented)
      } else if (+rented === +roomRented) {
        cell.setAttribute('data-rented', roomRented)
      } else {
        cell.removeAttribute('data-rented')
      }
    })
  }

  actionsCell(callback = () => { }) {
    this.cells.forEach(cell => {
      const cellId = cell.getAttribute('data-cell-num')
      callback({ cell, cellId })
    })
  }

  render(scheme, data) {
    if (!this.wrapScheme) return
    const { plan_rooms } = data

    this.wrapScheme.innerHTML = scheme
    this.cells = this.wrapScheme.querySelectorAll('.warehouse__svg-cell')

    this.setNumRooms(plan_rooms)
    this.actionsCell(({ cell, cellId }) => {
      if (this.numRooms[cellId]) {
        cell.setAttribute('data-rented', this.numRooms[cellId].rented)
      } else {
        cell.removeAttribute('data-rented')
      }
    })
  }

  setNumRooms(rooms) {
    this.numRooms = {}
    rooms.forEach(room => this.numRooms[room.room_name] = room)
  }
}

export default Scheme