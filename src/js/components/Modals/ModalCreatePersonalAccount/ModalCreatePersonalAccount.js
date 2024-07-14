import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { validate } from "./validate.js"

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
    this.validator.revalidate(isValid => {
      console.log(this.roomIds)
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = {}
      Array.from(formData).forEach(obj => data[obj[0]] = obj[1])
    })
  }

}

const modalCreatePersonalAccount = new ModalCreatePersonalAccount()

export default modalCreatePersonalAccount