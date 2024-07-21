import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { validate } from "./validate.js"
import { api } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"
import { PopupSelectSend } from "../utils/PopupSelectSend/PopupSelectSend.js"

class ModalCreatePersonalAccount extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-personal-account'],
      ...options
    })

    this.sendData = {}
    this.isSend = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form')
    this.validator = validate(this.form)
    this.button = this.modalBody.querySelector('.btn-form')
    this.popupSelectSend = PopupSelectSend(this.modalBody)

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.modalBody.addEventListener('click', this.handleClick.bind(this))
    this.popupSelectSend.onClick = typeSend => {
      this.sendData.send_what = typeSend
      this.registerUser(this.sendData)
    }
  }

  handleClick(e) {
    if (e.target.closest('.btn-submit')) {
      this.handleSubmit(e)
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
  
      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      Array.from(formData).forEach(obj => this.sendData[obj[0]] = obj[1])

      this.popupSelectSend.show()
    })
  }

  clearForm() {
    this.form.reset()
    this.validator.refresh()
    this.isSend = false
    this.button.classList.remove('shipped')
  }

  onClose() {
    this.clearForm()
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

  async registerUser(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_register_user_by_admin_', data)
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        this.isSend = true
        this.button.classList.add('shipped')
      }
    } catch (error) {
      console.log(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalCreatePersonalAccount = new ModalCreatePersonalAccount()

export default modalCreatePersonalAccount