import BaseModal from "../BaseModal.js";
import content from './content.html'

class ModalAuth extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-auth'],
      closeMethods: [],
      ...options
    })
  }
}

const modalAuth = new ModalAuth()

export default modalAuth