import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { validate } from "./validate.js"
import { api } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class ModalCreatePersonalAccount extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-personal-account'],
      ...options
    })

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form')
    this.validator = validate(this.form)
    this.button = this.modalBody.querySelector('.btn-form')

    this.events()
  }

  events() {
    this.button.addEventListener('click', this.handleSubmit.bind(this))
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
  }

  handleSubmit(e) {
    e.preventDefault();
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = {}

      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

      this.createAccount(data)
    })
  }

  onClose() {
    this.form.reset()
    this.validator.refresh()
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
            this.close()
          }
        })
        return false
      }
    }

    return true;
  }

  async createAccount(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_register_user_by_admin_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
      this.onClose()
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalCreatePersonalAccount = new ModalCreatePersonalAccount()

export default modalCreatePersonalAccount