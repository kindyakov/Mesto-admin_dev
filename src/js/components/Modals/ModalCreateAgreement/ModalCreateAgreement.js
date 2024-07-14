import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { itemHtml } from "../utils/html.js"
import SearchRoom from "../../SearchRoom/SearchRoom.js"

class ModalCreateAgreement extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-agreement'],
      ...options,
    })

    this.roomIds = []

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.electRoomId = this.modalBody.querySelector('.select-room-id')
    this.searchRoom = new SearchRoom(this.electRoomId)
    this.form = this.modalBody.querySelector('.form')
    this.validator = null
    this.button = this.modalBody.querySelector('.btn-form')

    this.events()
  }

  events() {
    this.modalBody.addEventListener('click', this.handleClick.bind(this))
    this.button.addEventListener('click', this.handleSubmit.bind(this))
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.searchRoom.onSelect = ids => {
      this.roomIds = []
      if (ids.length) {
        this.roomIds = ids
        this.electRoomId.innerHTML = ''

        ids.forEach(id => {
          this.electRoomId.insertAdjacentHTML('beforeend', itemHtml(id))
        });

        this.electRoomId.classList.remove('just-validate-error-field')
      }
    }
  }

  handleClick(e) {
    const item = e.target.closest('.custom-input__item')
    const btnClose = e.target.closest('.btn-del')
    if (item) {
      this.searchRoom.tippy.hide()
    }

    if (btnClose) {
      const roomId = btnClose.getAttribute('data-room-id')
      const index = this.roomIds.findIndex(id => id === +roomId)
      this.roomIds.splice(index, 1)
      item.remove()
      if (!this.roomIds.length) {
        this.searchRoom.tippy.show()
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.roomIds.length) {
      this.electRoomId.classList.add('just-validate-error-field')
      return
    }
  }
}

const modalCreateAgreement = new ModalCreateAgreement()

export default modalCreateAgreement