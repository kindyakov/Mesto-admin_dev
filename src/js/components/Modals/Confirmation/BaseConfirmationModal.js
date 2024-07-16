import { Loader } from "../../../modules/myLoader.js";
import content from "./utils/content.html"

class BaseConfirmationModal {
  constructor(title = 'Заголовок', classModal = '', options) {
    const mergerOptions = Object.assign({
      footer: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Close",
      cssClass: [classModal, 'modal-confirmation'],
    }, options)

    this.modal = new tingle.modal({
      ...mergerOptions,
      onOpen: this.onOpen.bind(this),
      onClose: this.onClose.bind(this),
      beforeClose: this.beforeClose.bind(this),
    });

    this.setContent(title)
  }

  setContent(title) {
    this.modal.setContent(content);
    this.modalBody = this.modal.modal.querySelector('.modal__body')
    this.modalTitle = this.modalBody.querySelector('.modal__title')
    this.modalTitle.innerHTML = title
    this.loader = new Loader(this.modalBody)

    this.btnNo = this.modalBody.querySelector('.btn-no')
    this.btnYes = this.modalBody.querySelector('.btn-yes')

    const closeButton = this.modal.modal.querySelector('.tingle-modal__close')

    if (closeButton) {
      closeButton.remove();
    }

    this.btnNo.addEventListener('click', () => this.handleClick(false))
    this.btnYes.addEventListener('click', () => this.handleClick(true))
  }

  handleClick(is) {
    this.onClick(is)
    !is && this.close()
  }

  open(button = null) {
    if (button) {
      this.onOpen(button)
    }
    this.modal.open()
  }

  close() {
    this.modal.close();
  }

  onOpen() {
    // Дополнительная логика при открытии модального окна (если нужно)
  }

  onClick() {

  }

  onClose() {
    // Дополнительная логика при закрытии модального окна (если нужно)
  }

  beforeClose() {
    // Логика перед закрытием модального окна (если нужно)
    return true;
  }

  extractData(params) {
    const isElement = (params instanceof Element);
    const isObject = (params && typeof params === 'object' && !Array.isArray(params) && params !== null && !(params instanceof Element));
    if (!isElement && !isObject) return null
    return isElement ? JSON.parse(params.getAttribute('data-json')) : params
  }
}

export default BaseConfirmationModal;
