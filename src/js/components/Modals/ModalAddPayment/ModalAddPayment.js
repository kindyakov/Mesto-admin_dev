import BaseModal from "../BaseModal.js";
import content from "./content.html"
import { validate } from "./validate.js";

import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";

class ModalAddPayment extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-add-payment'],
      ...options
    })

    this.agrId = null
    this.isEdit = false

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.selects = new Select({ uniqueName: 'select-modal-add-payment', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form-add-payment')
    this.btnAddPayment = this.modalBody.querySelector('.btn-add-payment')
    this.validator = validate(this.form)

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.btnAddPayment.addEventListener('click', this.handleSubmit.bind(this))
  }

  handleSubmit() {
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = {}

      formData.set('amount', formData.get('amount').replace(/[^0-9]/g, ''))
      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      this.addPayment(data, this.agrId).finally(() => {
        this.validator.refresh()
        this.form.reset()
        this.isEdit = false
      })
    })
  }

  beforeClose() {
    if (this.isEdit) {
      outputInfo({
        msg: 'У вас есть несохраненные изменения.</br>Вы уверены, что хотите закрыть окно?',
        msg_type: 'warning',
        isConfirm: true
      }, isConfirm => {
        if (isConfirm) {
          this.isEdit = false
          this.close()
        }
      });

      return false;
    } else {
      return true;
    }
  }

  onOpen(params = null) {
    this.validator?.calendars.forEach(calendar => calendar.redraw())
    if (!params) return
    const extractData = this.extractData(params)
    if (!extractData) return
    this.agrId = extractData.agrid
  }

  async addPayment(data, id) {
    try {
      this.loader.enable()
      const response = await api.post(`/_add_payment_/${id}`, data)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalAddPayment = new ModalAddPayment()

export default modalAddPayment