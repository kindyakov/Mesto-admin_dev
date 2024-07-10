import BaseModal from "../BaseModal.js";
import content from './content.html'

class ModalPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-passport'],
      ...options
    })
  }
}

const modalPassport = new ModalPassport()

export default modalPassport