import BaseModal from "../BaseModal.js"
import content from './content.html'
import { renderForm } from "../utils/renderForm.js"
import { getAgreementTotal } from "../../../settings/request.js";
import { formattingPrice } from "../../../utils/formattingPrice.js";
import { api } from "../../../settings/api.js";
import { outputInfo } from "../../../utils/outputinfo.js";

class ModalFinancialInformation extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-financial-information'],
      ...options
    })

    this.roomId = null
    this.agrId = null
  }

  renderModal(roomId, { rooms }) {
    const [room] = rooms.filter(room => room.room_id == roomId)
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(room))
    })

    this.agrId = room.agrid
    this.roomId = room.room_id

    this.renderElements.length && this.renderElements.forEach(el => {
      renderForm(el, room)
      if (el.name == 'deposit') {
        el.value = `${formattingPrice(+el.value)} / ${formattingPrice(room.return_amount)}`
      }
    })
  }

  onSaveValue({ input, name }) {
    const formData = new FormData()

    formData.set('agrid', this.agrId)
    formData.set('room_id', this.roomId)

    if (name == 'price') {
      formData.set('price', input.value.replace(/\D/g, ''))
      this.changeValue('/_edit_agreement_price_', formData)
    } if (name == 'deposit') {
      formData.set('deposit', input.value.replace(/\D/g, ''))
      this.changeValue('/_edit_agreement_deposit_', formData)
    }
  }

  async changeValue(rout, formData) {
    try {
      this.loader.disable()
      const response = await api.post(rout, formData)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      this.loader.disable()
    }
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