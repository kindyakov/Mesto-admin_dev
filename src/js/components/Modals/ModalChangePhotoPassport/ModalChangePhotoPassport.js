import BaseModal from "../BaseModal.js"
import content from "./content.html"

class ModalChangePhotoPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-change-photo-passport'],
      ...options
    })
  }
}

const modalChangePhotoPassport = new ModalChangePhotoPassport()

export default modalChangePhotoPassport