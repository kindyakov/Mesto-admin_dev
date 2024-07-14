import BaseModal from "../BaseModal.js"
import content from './content.html'
import { formattingPrice } from "../../../utils/formattingPrice.js"
import { getFormattedDate } from "../../../utils/getFormattedDate.js"
import { declOfNum } from "../../../utils/declOfNum.js"
import { renderForm } from "../utils/renderForm.js"

class ModalFinancialInformation extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-financial-information'],
      ...options
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

  onOpen(params = null) {
    if (!params) return
    const extractData = this.extractData(params)
    if (extractData) {
      this.renderModal(extractData)
    }
  }
}

const modalFinancialInformation = new ModalFinancialInformation()

export default modalFinancialInformation