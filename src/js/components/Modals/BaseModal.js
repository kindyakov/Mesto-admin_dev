import { Loader } from "../../modules/myLoader.js";

// Базовый класс для модального окна
class BaseModal {
  constructor(content, options) {
    const mergerOptions = Object.assign({
      footer: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Close",
      cssClass: ['custom-modal'],
    }, options)

    this.modal = new tingle.modal({
      ...mergerOptions,
      onOpen: this.onOpen.bind(this),
      onClose: this.onClose.bind(this),
      beforeClose: this.beforeClose.bind(this),
    });

    this.isEdit = false
    this.enablePhotoUpload = options.enablePhotoUpload || false

    this.setContent(content);
  }

  onOpen() {
  }

  onClose() {
  }

  onSave() {
  }

  beforeClose() {
    return true;
  }

  setContent(content) {
    this.modal.setContent(content);
    this.modalBody = this.modal.modal.querySelector('.modal__body')
    this.loader = new Loader(this.modalBody)
    const closeButton = this.modal.modal.querySelector('.tingle-modal__close')

    if (closeButton) {
      closeButton.remove();
    }

    if (this.enablePhotoUpload) {
      this.isSendFile = false;
      this.file = null;
      this.initPhotoUpload();
    }

    this.modalBody.addEventListener('click', e => {
      const button = e.target.closest('[data-modal]');

      if (button && button.getAttribute('data-modal')) {
        this.close()
      }
    })
  }

  initPhotoUpload() {
    this.inputFile = this.modalBody.querySelector('.input-file');
    this.label = this.modalBody.querySelector('.modal__upload_lable');
    this.img = this.modalBody.querySelector('.img');
    this.btnSave = this.modalBody.querySelector('.btn-save');
    this.acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    this.initPhotoEvents();
  }

  initPhotoEvents() {
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
    } else {
      this.label.classList.add('_error');
    }
  }

  open(button = null) {
    this.modal.open()
    if (button) {
      this.onOpen(button)
    }
  }

  close() {
    this.modal.close();
  }

  extractData(params) {
    const isElement = (params instanceof Element);
    const isObject = (params && typeof params === 'object' && !Array.isArray(params) && params !== null && !(params instanceof Element));
    if (!isElement && !isObject) return null
    return isElement ? JSON.parse(params.getAttribute('data-json')) : params
  }
}

export default BaseModal