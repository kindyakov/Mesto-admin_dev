import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from "./validate.js"
import { outputInfo } from "../../../utils/outputinfo.js"
import { api } from "../../../settings/api.js"

class ModalCreateLock extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-lock'],
      ...options
    })

    this.isSend = false
    this.currentLock = null
    this.isEditMode = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form-create-lock')
    this.validator = validate(this.form)
    this.button = this.modalBody.querySelector('.btn-form')
    this.title = this.modalBody.querySelector('.modal__title')
    this.events()
  }

  events() {
    this.modalBody.addEventListener('click', this.handleClick.bind(this))
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
  }

  handleClick(e) {
    if (e.target.closest('.btn-submit')) {
      this.handleSubmit(e)
    }
  }

  openForEdit(data) {
    this.isEditMode = true
    this.currentLock = data
    this.title.textContent = 'Редактировать замок:'

    if (this.form) {
      const lockNumInput = this.form.querySelector('input[name="lock_num"]')
      const lockIdInput = this.form.querySelector('input[name="lock_id"]')

      if (lockNumInput) lockNumInput.value = data.lock_num || ''
      if (lockIdInput) lockIdInput.value = data.lock_id || ''
    }

    super.open()
  }

  open(button) {
    if (!this.isEditMode) {
      this.currentLock = null
      this.title.textContent = 'Создать замок:'
      this.clearForm()
    }
    super.open(button)
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.isSend) return;

    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      this.sendData()
    })
  }

  async sendData() {
    this.isSend = true
    this.loader.enable()

    const formData = new FormData(this.form)
    let data = {}
    Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

    try {
      const url = this.isEditMode ? '/_edit_lock_' : '/_add_lock_'
      const response = await api.post(url, data)

      if (response.status === 200) {
        window.app.notify.show(response.data)
        this.close()
        this.onSave()
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
      this.isSend = false
    }
  }

  clearForm() {
    this.form.reset()
    this.validator.refresh()
    this.isSend = false
  }

  onClose() {
    this.clearForm()
    this.isEditMode = false
    this.currentLock = null
  }
}

const modalCreateLock = new ModalCreateLock()

export default modalCreateLock