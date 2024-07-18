import BaseModal from "../BaseModal.js"
import content from "./content.html"

class ModalPhotoRoom extends BaseModal {
  constructor() {
    super(content, {
      cssClass: ['modal-photo-room']
    })

    this.img = this.modalBody.querySelector('.img')
  }

  onOpen(params) {
    if (!params) return
    const extractData = this.extractData(params)
    if (extractData?.client_photo_link) {
      this.img.src = extractData.client_photo_link      
    }
  }

  onClose() {
    this.img.src = ''
  }
}

const modalPhotoRoom = new ModalPhotoRoom()

export default modalPhotoRoom