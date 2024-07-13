import BaseModal from "../BaseModal.js";
import content from './content.html'

import { Loader } from "../../../modules/myLoader.js";

import { api } from "../../../settings/api.js";
import { formatPhoneNumber } from "../../../utils/formattingPrice.js";
import { getFormattedDate } from "../../../utils/getFormattedDate.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { getOldClient } from "../../../settings/request.js";

class ModalOldClient extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-old-client'],
      ...options
    })
    this.loader = new Loader(this.modalBody)
  }

  renderModal({ client }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(client))
    })

    this.renderElements.length && this.renderElements.forEach(el => {
      const renderName = el.getAttribute('data-render')
      const value = client[renderName] ? client[renderName] : ''

      if (el.tagName === 'INPUT') {
        if (el.name === 'username') {
          el.value = formatPhoneNumber(value)
        } else if (el.name === 'birthday') {
          el.value = getFormattedDate(value)
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

  async onOpen(params) {
    if (!params) return
    try {
      this.loader.enable()
      const extractData = this.extractData(params)
      if (!extractData) return
      const data = await getOldClient({ user_id: extractData.user_id })
      if (data) {
        this.renderModal(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalOldClient = new ModalOldClient()

export default modalOldClient