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

    this.setContent(content);
  }

  setContent(content) {
    this.modal.setContent(content);
    this.modalBody = this.modal.modal.querySelector('.modal__body')
    this.loader = new Loader(this.modalBody)
    const closeButton = this.modal.modal.querySelector('.tingle-modal__close')

    if (closeButton) {
      closeButton.remove();
    }

    this.modalBody.addEventListener('click', e => {
      const button = e.target.closest('[data-modal]');

      if (button && button.getAttribute('data-modal')) {
        this.close()
      }
    })
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

  onOpen() {
  }

  onClose() {
  }

  beforeClose() {
    return true;
  }

  extractData(params) {
    const isElement = (params instanceof Element);
    const isObject = (params && typeof params === 'object' && !Array.isArray(params) && params !== null && !(params instanceof Element));
    if (!isElement && !isObject) return null
    return isElement ? JSON.parse(params.getAttribute('data-json')) : params
  }
}

export default BaseModal