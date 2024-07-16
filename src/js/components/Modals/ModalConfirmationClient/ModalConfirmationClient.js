import BaseModal from "../BaseModal.js"
import content from "./content.html"

class ModalConfirmationClient extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-confirmation-client'],
      ...options,
    })
  }
}

const modalConfirmationClient = new ModalConfirmationClient()

export default modalConfirmationClient