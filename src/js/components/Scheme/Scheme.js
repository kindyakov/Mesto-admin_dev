class Scheme {
  constructor() {
    this.schemes = document.querySelectorAll('.scheme')
    this.numRooms = {}

    this.init()
  }

  init() {
    if (!this.schemes.length) return
    this.cells = document.querySelectorAll('.warehouse__svg-cell')
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
      const roomRented = this.numRooms[cellId].rented
      if (+rented === -1) {
        cell.setAttribute('data-rented', roomRented)
        return
      }

      if (+rented === +roomRented) {
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

  render(data) {
    if (!this.schemes.length) return
    const { plan_rooms } = data
    this.numRooms = {}
    plan_rooms.forEach(room => this.numRooms[room.room_id] = room)

    this.actionsCell(({ cell, cellId }) => {
      if (this.numRooms[cellId]) {
        cell.setAttribute('data-rented', this.numRooms[cellId].rented)
      } else {
        cell.removeAttribute('data-rented')
      }
    })
  }
}

export default Scheme