import BaseModal from "../BaseModal.js"
import content from "./content.html"

class ModalDownloadPhotoWh extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-download-photo-wh'],
      enablePhotoUpload: true,
      ...options,
    })

    this.onSave = () => { }
  }

  onClose() {
    this.file = null;
    this.img.src = '';
    this.label.classList.remove('_error', '_is-load', '_is-drag');
  }

  onSave() {
    this.onSave()
  }
}

const modalDownloadPhotoWh = new ModalDownloadPhotoWh()

export default modalDownloadPhotoWh