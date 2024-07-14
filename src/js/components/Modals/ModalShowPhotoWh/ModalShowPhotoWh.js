import BaseModal from "../BaseModal.js"
import content from "./content.html"

class ModalShowPhotoWh extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-show-photo-wh']
    })

    this.img = this.modalBody.querySelector('.img')
  }

  onOpen(params) {
    if (!params) return
    const extractData = this.extractData(params)
    this.img.src = extractData.showPhoto
  }

  onClose() {
    this.img.src = ''
  }
}

const modalShowPhotoWh = new ModalShowPhotoWh()

export default modalShowPhotoWh