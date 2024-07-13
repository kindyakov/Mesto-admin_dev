import BaseModal from "../BaseModal.js";
import content from './content.html'

class ModalAddClient extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-add-client'],
      ...options
    })
  }
}

const modalAddClient = new ModalAddClient()

export default modalAddClient