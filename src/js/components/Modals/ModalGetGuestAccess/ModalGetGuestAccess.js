import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { itemEl } from "../utils/html.js"
import { validate } from "./validate.js"
import SearchRoom from "../../SearchRoom/SearchRoom.js"
import { api } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"
import { PopupSelectSend } from "../utils/PopupSelectSend/PopupSelectSend.js"

class ModalGetGuestAccess extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-get-guest-access'],
      ...options
    })

    this.roomIds = []
    this.sendData = {}
    this.isSend = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.electRoomId = this.modalBody.querySelector('.select-room-id')
    this.searchRoom = new SearchRoom(this.electRoomId, {}, { isOne: true })
    this.form = this.modalBody.querySelector('.form')
    this.validator = validate(this.form)
    this.button = this.modalBody.querySelector('.btn-form')

    this.popupSelectSend = PopupSelectSend(this.modalBody)

    this.events()
  }

  events() {
    this.modalBody.addEventListener('click', this.handleClick.bind(this))
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.searchRoom.onSelect = ids => {
      if (ids.length) {
        this.roomIds = ids
        this.electRoomId.innerHTML = ''

        ids.length && this.electRoomId.append(...ids.map(id => itemEl(id, curId => {
          const index = this.roomIds.findIndex(_id => _id === curId)
          this.roomIds.splice(index, 1)
          if (!this.roomIds.length) {
            this.searchRoom.tippy.show()
          }
        })))

        this.electRoomId.classList.remove('just-validate-error-field')
      }
    }

    this.popupSelectSend.onClick = typeSend => {
      this.sendData.send_what = typeSend
      this.testRoomAdmin(this.sendData)
    }
  }

  handleClick(e) {
    if (e.target.closest('.custom-input__item')) {
      this.searchRoom.tippy.hide()
    }

    if (e.target.closest('.btn-submit')) {
      this.handleSubmit(e)
    }
  }

  handleSubmit(e) {
    if (!this.roomIds.length) {
      this.searchRoom.tippy.show()
      this.electRoomId.classList.add('just-validate-error-field')
      return
    }

    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      this.sendData = { room_id: this.roomIds[0] }

      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      Array.from(formData).forEach(obj => this.sendData[obj[0]] = obj[1])

      this.popupSelectSend.show()
    })
  }

  checkValue() {
    const inputs = this.form.querySelectorAll('input')
    let isValue = false
    inputs.length && inputs.forEach(input => {
      if (input.value !== '') {
        isValue = true
      }
    })
    return isValue
  }

  beforeClose() {
    if (this.checkValue() && !this.isSend) {
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

    return true;
  }

  clearForm() {
    this.electRoomId.classList.remove('just-validate-error-field')
    this.electRoomId.innerHTML = ''
    this.roomIds = []
    this.form.reset()
    this.validator.refresh()
    this.isSend = false
    this.button.classList.remove('shipped')
  }

  onClose() {
    this.clearForm()
  }

  async testRoomAdmin(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_test_room_by_admin_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        this.isSend = true
        this.button.classList.add('shipped')
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalGetGuestAccess = new ModalGetGuestAccess()

export default modalGetGuestAccess