import { Modal } from "../../../modules/myModal.js";
import { Loader } from "../../../modules/myLoader.js";
import { getClientTotal } from "../../../settings/request.js";
import { agreementHtml } from "./html.js";

class ModalClient {
  constructor(options) {
    this.modal = new Modal({ unique: 'modal-client' })
    this.modalBody = this.modal.modalBody
    this.loader = new Loader(this.modalBody)
    this.userId = null
    this.open = this.modal.open.bind(this.modal)
    this.close = this.modal.close.bind(this.modal)
    this.modal.onOpen = this.handleOpen.bind(this)
  }

  renderModal({ client, agreements }) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.renderElements.length && this.renderElements.forEach(el => {
      const renderName = el.getAttribute('data-render')
      if (el.tagName === 'INPUT') {
        el.value = client[renderName]
      }
    })

    this.contentAgreements = this.modalBody.querySelector('.modal-content-agreements')
    this.contentAgreements.innerHTML = ''
    agreements.length && agreements.forEach(agreement => {
      this.contentAgreements.insertAdjacentElement('beforeend', agreementHtml(agreement))
    })
  }

  async handleOpen() {
    try {
      this.loader.enable()
      const data = await getClientTotal(this.userId)
      this.renderModal(data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalClient = new ModalClient();

export default modalClient;