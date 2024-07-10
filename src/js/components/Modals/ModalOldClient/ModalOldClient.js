import { Modal } from "../../../modules/myModal.js";
import { Loader } from "../../../modules/myLoader.js";

import { api } from "../../../settings/api.js";
import { formatPhoneNumber } from "../../../utils/formattingPrice.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { getOldClient } from "../../../settings/request.js";

import { validateClient } from "./validate.js";

class ModalOldClient {
  constructor(options) {
    this.modal = new Modal({ unique: 'modal-old-client' })
    this.modalBody = this.modal.modalBody
    this.loader = new Loader(this.modalBody)
    this.open = this.modal.open.bind(this.modal)
    this.close = this.modal.close.bind(this.modal)
    this.modal.onOpen = this.handleOpen.bind(this)
    this.init()
  }
  init() {
    if (!this.modalBody) return
    this.formClientData = this.modalBody.querySelector('.form-client-data')
    this.validatorClient = validateClient(this.formClientData)

    this.events()
  }

  renderModal({ client }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.renderElements.length && this.renderElements.forEach(el => {
      const renderName = el.getAttribute('data-render')
      const value = client[renderName] ? client[renderName] : ''

      if (el.tagName === 'INPUT') {
        if (el.name === 'username') {
          el.value = formatPhoneNumber(value)
        } else if (el.name === 'birthday') {
          el.value = getFormattedDate(value)
          this.validatorClient?.calendarBirthday.setDate(getFormattedDate(value), true, "d.m.Y")
        } else {
          el.value = value
        }
      } else if (el.tagName === 'IMG') {
        el.src = value
      } else if (el.classList.contains('wp-status')) {
        el.classList.remove('confirmed', 'not-confirmed')
        el.classList.add(`${value ? 'confirmed' : 'not-confirmed'}`)
      } else {
        el.textContent = value
      }
    })
  }

  async handleOpen(e) {
    try {
      this.loader.enable()
      console.log(e)
      
      // const data = await getOldClient({ user_id: this.userId })
      // this.renderModal(data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalOldClient = new ModalOldClient()
export default modalOldClient