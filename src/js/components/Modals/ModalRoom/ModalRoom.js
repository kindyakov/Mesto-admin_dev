import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { renderForm } from "../utils/renderForm.js"

class ModalRoom extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-room'],
      ...options
    })
  }

  renderModal(room) {
    this.renderElements = this.modalBody.querySelectorAll('[data-render]')
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')

    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('room-id', room.room_id)
    })

    this.renderElements.length && this.renderElements.forEach(el => renderForm(el, room))
  }

  async onOpen(params = null) {
    if (!params) return
    try {
      this.loader.enable()
      let id = ''

      if (params instanceof Element) {
        id = params.getAttribute('user-id')
      } else {
        id = params
      }

      if (!id) return

      const data = await getClientTotal(user_id + '/')
      if (data) {
        this.renderModal(data)
        this.data = data
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalRoom = new ModalRoom()

export default modalRoom