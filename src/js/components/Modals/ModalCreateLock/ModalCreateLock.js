import BaseModal from "../BaseModal.js"
import content from './content.html'
import { validate } from "./validate.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class ModalCreateLock extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-create-lock'],
      ...options
    })

    this.isSend = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.form = this.modalBody.querySelector('.form-create-lock')
    this.validator = validate(this.form)
    this.button = this.modalBody.querySelector('.btn-form')
    this.events()
  }

  events() {
    this.modalBody.addEventListener('click', this.handleClick.bind(this))
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.searchRoom.onSelect = ids => this.roomIds = ids;
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
      let data = {}
      Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

    })
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
      });

      return false;
    } else {
      return true;
    }
  }

  clearForm() {
    this.form.reset()
    this.validator.refresh()
    this.isSend = false
  }

  onClose() {
    this.clearForm()
  }
}

const modalCreateLock = new ModalCreateLock()

export default modalCreateLock