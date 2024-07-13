import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { declOfNum } from "../../../utils/declOfNum.js"
import { getFormattedDate } from "../../../utils/getFormattedDate.js"


class ModalRoom extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-room'],
      ...options
    })
  }

  renderModal(room) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('data-json', JSON.stringify(room))
    })

    this.renderElements.length && this.renderElements.forEach(el => {
      const [name, type] = el.getAttribute('data-render').split(',')
      const value = room[name] ? room[name] : ''

      if (el.tagName === 'INPUT') {
        if (type === 'date') {
          el.value = getFormattedDate(value)
        } else if (type === 'area') {
          el.value = value + ' м²'
        } else if (type === 'day') {
          el.value = !!value ? `${value} ${declOfNum(Math.abs(+value), ['день', 'дня', 'дней'])}` : ''
        } else {
          el.value = value
        }
      }
      else {
        el.textContent = value
      }
    })
  }

  onOpen(params = null) {
    if (!params) return
    const extractData = this.extractData(params)
    if (extractData) {
      this.renderModal(extractData)
    }
  }
}

const modalRoom = new ModalRoom()

export default modalRoom