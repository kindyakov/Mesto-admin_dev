import BaseModal from "../BaseModal.js"
import content from './content.html'
import { renderForm } from "../utils/renderForm.js"
import { getAgreementTotal } from "../../../settings/request.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";

class ModalFinancialInformation extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-financial-information'],
      ...options
    })
  }

  renderModal(roomId, { rooms }) {
    const [room] = rooms.filter(room => room.room_id == roomId)
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(room))
    })

    this.renderElements.length && this.renderElements.forEach(el => {
      renderForm(el, room)
      if (el.name == 'deposit') {
        el.value = `${el.value} / ${formattingPrice(room.return_amount)}`
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

const modalFinancialInformation = new ModalFinancialInformation()

export default modalFinancialInformation