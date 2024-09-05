import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { api } from "../../../settings/api.js"
import { renderForm } from "../utils/renderForm.js"
import { outputInfo } from "../../../utils/outputinfo.js"
import { formattingPrice } from "../../../utils/formattingPrice.js"
import modalConfirmationDepartureRoom from "../Confirmation/ModalConfirmationDepartureRoom/ModalConfirmationDepartureRoom.js"

class ModalConfirmationDeparture extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-confirmation-departure'],
      ...options
    })
    this.roomData = null
    this.btn = this.modalBody.querySelector('.btn-confirm')
    this.btnChangeReturnAmount = this.modalBody.querySelector('.btn-change-return-amount')
    this.inputReturnAmount = this.modalBody.querySelector('[name="return_amount"]')

    modalConfirmationDepartureRoom.onClick = this.onConfirm.bind(this)

    this.btn.addEventListener('click', () => {
      modalConfirmationDepartureRoom.changePrice(+this.replace(this.inputReturnAmount))
    })

    this.inputReturnAmount.addEventListener('input', e => {
      const input = e.target
      const value = parseFloat(this.replace(input))
      input.value = formattingPrice(value)
    })

    this.inputReturnAmount.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const input = e.target
        const value = parseFloat(input.value.replace(/[,\s₽]/g, '').slice(0, -1))
        input.value = formattingPrice(value)
      }
    });

    this.btnChangeReturnAmount.addEventListener('click', () => {
      if (this.roomData) {
        this.editReturnAmount({
          room_id: this.roomData.room_id,
          agrid: this.roomData.agrid,
          return_amount: +this.replace(this.inputReturnAmount)
        })
      }
    })
  }

  onConfirm(isConfirm) {
    const roomId = this.roomData.room_id

    if (isConfirm && this.roomData) {
      this.approveLeaving({ room_id: this.roomData.room_id, agrid: this.roomData.agrid })
      modalConfirmationDepartureRoom.close()
    } else {
      this.open(roomId)
    }
  }

  replace(input) {
    return input.value.replace(/[,\s₽]/g, '')
  }

  renderModal(room) {
    this.roomData = room

    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(room))
    })

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, room))

    this.inputReturnAmount.removeAttribute('readonly', 'true')
    this.btn.classList.remove('_confirmed')
    this.btnChangeReturnAmount.classList.remove('_none')

    if (room.leave_approved) {
      this.inputReturnAmount.setAttribute('readonly', 'true')
      this.btnChangeReturnAmount.classList.add('_none')
      this.btn.classList.add('_confirmed')
    }
  }

  async onOpen(params = null) {
    if (!params) return
    try {
      this.loader.enable()
      let id = ''

      if (params instanceof Element) {
        id = params.getAttribute('room-id')
      } else {
        id = params
      }

      if (!id) return

      const response = await api.get(`/_get_moving_out_room_info_?room_id=${id}`)
      if (response.status !== 200) return
      const { room = null } = response.data
      if (room) {
        this.renderModal(room)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async editReturnAmount(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_edit_return_amount_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
      throw error
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
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

const modalConfirmationDeparture = new ModalConfirmationDeparture()

export default modalConfirmationDeparture