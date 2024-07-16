import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { api } from "../../../settings/api.js"
import { renderForm } from "../utils/renderForm.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class ModalConfirmationDeparture extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-confirmation-departure'],
      ...options
    })
    this.roomData = null
    this.btn = this.modalBody.querySelector('.btn-confirm')

    this.btn.addEventListener('click', () => {
      if (this.roomData) {
        this.approveLeaving({ room_id: this.roomData.room_id, agrid: this.roomData.agrid })
      }
    })
  }

  renderModal(room) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(room))
    })

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, room))
  }

  async onOpen(params = null) {
    if (!params) return
    try {
      const extractData = this.extractData(params)
      if (!extractData) return
      this.loader.enable()
      const response = await api.get(`/_get_moving_out_room_info_?room_id=${extractData.room_id}`)
      if (response.status !== 200) return
      const { room = null } = response.data
      if (room) {
        this.roomData = room
        this.renderModal(room)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async approveLeaving(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_approve_leaving_of_room_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
      this.roomData = null
      this.close()
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalConfirmationDeparture = new ModalConfirmationDeparture()

export default modalConfirmationDeparture