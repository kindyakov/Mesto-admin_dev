import BaseModal from "../BaseModal.js";
import content from "./content.html";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js"

class ModalChangePhotoPassport extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-change-photo-passport'],
      ...options
    });

    this.isSendFile = false
    this.file = null;
    this.userId = null

    this.init();
  }

  init() {
    if (!this.modalBody) return;
    this.inputFile = this.modalBody.querySelector('.input-file');
    this.label = this.modalBody.querySelector('.modal__upload_lable');
    this.img = this.modalBody.querySelector('.img');
    this.btnSave = this.modalBody.querySelector('.btn-save');
    this.acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    this.initEvents();
  }

  initEvents() {
    this.label.addEventListener('dragover', this.onDragOver.bind(this));
    this.label.addEventListener('dragleave', this.onDragLeave.bind(this));
    this.label.addEventListener('drop', this.onDrop.bind(this));
    this.inputFile.addEventListener('change', this.onFileChange.bind(this));
    this.btnSave.addEventListener('click', this.onSave.bind(this));
  }

  onDragOver(event) {
    event.preventDefault();
    this.label.classList.add('_is-drag');
  }

  onDragLeave() {
    this.label.classList.remove('_is-drag');
  }

  onDrop(event) {
    event.preventDefault();
    this.label.classList.remove('_is-drag');
    const file = event.dataTransfer.files[0];
    this.handleFile(file);
  }

  onFileChange() {
    const file = this.inputFile.files[0];
    this.handleFile(file);
  }

  handleFile(file) {
    if (file && this.acceptedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      this.file = file;

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.inputFile.files = dataTransfer.files;

      this.label.classList.add('_is-load');
      this.label.classList.remove('_error');
    }
  }

  onSave() {
    if (this.file) {
      this.label.classList.remove('_error');
      const formData = new FormData()
      formData.set('file', this.file)
      formData.set('user_id', this.userId)

      this.uploadPhoto(formData)
    } else {
      this.label.classList.add('_error');
    }
  }

  beforeClose() {
    if (!this.isSendFile) {
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
      this.isSendFile = true
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalChangePhotoPassport = new ModalChangePhotoPassport();

export default modalChangePhotoPassport;
