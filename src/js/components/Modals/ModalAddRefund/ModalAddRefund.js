import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { validate } from "./validate.js";

import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";

class ModalAddRefund extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-add-refund'],
      ...options
    })

    this.agrId = null

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.selects = new Select({ uniqueName: 'select-modal-add-refund', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form')
    this.btnAddPayment = this.modalBody.querySelector('.btn-add')
    this.validator = validate(this.form, { container: this.modalBody })

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

      formData.set('payment_date', dateFormatter(formData.get('payment_date'), 'yyyy-MM-dd'))
      formData.set('amount', formData.get('amount').replace(/[^0-9]/g, ''))
      formData.delete('flatpickr-month')

      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      this.addPayment(data, this.agrId)
        .then(({ msg_type = '' }) => {
          if (msg_type == 'success') {
            this.close()
            const prevModal = window.app.modalMap[this.btnOpenPrevModal.getAttribute('data-modal')]
            prevModal.open(this.agrId)
          }
        })
        .finally(() => {
          this.validator.refresh()
          this.form.reset()
          this.isEdit = false
        })
    })
  }

  renderModal(agrId) {
    this.attrsModal = this.modalBody.querySelectorAll('[data-modal]')
    this.attrsModal.length && this.attrsModal.forEach(el => {
      el.setAttribute('agr-id', agrId)
    })
  }

  onOpen(params = null) {
    if (!params) return
    if (params instanceof Element) {
      this.agrId = params.getAttribute('agr-id')
    } else {
      this.agrId = params
    }

    if (this.agrId) {
      this.renderModal(this.agrId)
    }
  }

  onClose() {
    this.agrId = null
  }

  async addPayment(data, id) {
    try {
      this.loader.enable()
      const response = await api.post(`/_add_payment_/${id}`, data)
      if (response.status !== 200) return
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

const modalAddRefund = new ModalAddRefund()

export default modalAddRefund