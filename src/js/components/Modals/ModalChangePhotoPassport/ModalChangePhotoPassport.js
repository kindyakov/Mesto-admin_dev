import BaseModal from "../BaseModal.js";
import content from "./content.html";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js"

class ModalChangePhotoPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-change-photo-passport'],
      enablePhotoUpload: true,
      ...options
    });

    this.isSendFile = false
    this.file = null;
    this.userId = null
  }

  onSave() {
    if (this.file) {
      this.label.classList.remove('_error');
      const formData = new FormData()
      formData.set('file', this.file)
      formData.set('user_id', this.userId)

      this.uploadPhoto(formData).then(data => {
        if (data.msg_type !== 'success') return
        this.close()
        const prevModal = window.app.modalMap[this.btnOpenPrevModal.getAttribute('data-modal')]
        prevModal.open(this.userId)
      })
    } else {
      this.label.classList.add('_error');
    }
  }

  beforeClose() {
    if (this.isSendFile) {
      outputInfo({
        msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите закрыть окно?',
        msg_type: 'warning',
        isConfirm: true
      }, isConfirm => {
        if (isConfirm) {
          this.file = null;
          this.close();
        }
      });

      return false;
    } else {
      return true;
    }
  }

  onOpen(params = null) {
    if (!params) return
    const extractData = this.extractData(params)
    this.userId = extractData.user_id
  }

  onClose() {
    this.userId = null
    this.file = null
    this.img.src = ''
    this.label.classList.remove('_error', '_is-load', '_is-drag')
  }

  async uploadPhoto(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_upload_new_passport_photo_', formData)
      if (response.status !== 200) return
      this.isSendFile = false
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalChangePhotoPassport = new ModalChangePhotoPassport();

export default modalChangePhotoPassport;
