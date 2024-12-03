import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { renderForm } from "../utils/renderForm.js"
import { getAgreementTotal } from "../../../settings/request.js";

class ModalRoom extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-room'],
      ...options
    })
  }

  renderModal(roomId, { rooms }) {
    const [room] = rooms.filter(room => room.room_id == roomId)
    this.btnCompleteRent = this.modalBody.querySelector('.btn-complete-rent')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('room-id', room.room_id)
      el.setAttribute('agr-id', room.agrid)
    })

    this.btnCompleteRent.classList.remove('_none')

    if (room.rentenddate) {
      if (new Date(room.rentenddate) > new Date()) {
        this.btnCompleteRent.innerText = 'Изменить дату выезда'
      } else {
        this.btnCompleteRent.classList.add('_none')
      }
    }

    this.renderElements.length && this.renderElements.forEach(el => {
      renderForm(el, room)
      if (el.name == 'warehouse_name') {
        el.value = `${room.warehouse_name} / ${room.floor}`
      }
    })
  }

  async onOpen(params = null) {
    if (!params) return
    try {
      this.loader.enable()
      let agrId = null, roomId = null

      if (params instanceof Element) {
        agrId = params.getAttribute('agr-id')
        roomId = params.getAttribute('room-id')
      } else {
        [agrId, roomId] = params
      }

      if (!agrId) return

      const data = await getAgreementTotal(agrId)
      if (data) {
        this.renderModal(roomId, data)
        this.data = data
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalRoom = new ModalRoom()

export default modalRoom