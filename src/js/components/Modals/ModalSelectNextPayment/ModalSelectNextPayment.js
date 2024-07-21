import BaseModal from "../BaseModal.js"
import content from './content.html'

class ModalSelectNextPayment extends BaseModal {
  constructor() {
    super(content, {
      cssClass: ['modal-select-next-payment']
    })
  }
}

const modalSelectNextPayment = new ModalSelectNextPayment()

export default modalSelectNextPayment