import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { itemHtml } from "../utils/html.js"
import { validate } from "./validate.js"
import SearchRoom from "../../SearchRoom/SearchRoom.js"
import { api } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class ModalGetGuestAccess extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-get-guest-access'],
      ...options
    })

    this.roomIds = []

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.electRoomId = this.modalBody.querySelector('.select-room-id')
    this.searchRoom = new SearchRoom(this.electRoomId, {}, { isOne: true })
    this.form = this.modalBody.querySelector('.form')
    this.validator = validate(this.form)
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

    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = { room_id: this.roomIds[0] }

      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

      this.testRoomAdmin(data)
    })
  }

  beforeClose() {
    for (const el of this.form.elements) {
      if (el.value !== '') {
        outputInfo({
          msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите закрыть окно?',
          msg_type: 'warning',
          isConfirm: true
        }, isConfirm => {
          if (isConfirm) {
            this.clearForm()
            this.close()
          }
        })
        return false
      }
    }

    return true;
  }

  clearForm() {
    this.form.reset()
    this.validator.refresh()
  }

  async testRoomAdmin(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_test_room_by_admin_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalGetGuestAccess = new ModalGetGuestAccess()

export default modalGetGuestAccess