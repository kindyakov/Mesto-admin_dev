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
    const closeButton = this.modal.modal.querySelector('.tingle-modal__close');
    if (closeButton) {
      closeButton.remove();
    }
  }

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  onOpen() {
    console.log('Modal opened');
  }

  onClose() {
    console.log('Modal closed');
  }

  beforeClose() {
    return true;
  }
}

export default BaseModal