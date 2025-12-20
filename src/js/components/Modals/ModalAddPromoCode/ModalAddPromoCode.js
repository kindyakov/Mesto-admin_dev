import BaseModal from "../BaseModal.js"
import content from "./content.html"
import { validate } from "./validate.js";

import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { addPromoCode } from "../../../settings/request.js";

class ModalAddPromoCode extends BaseModal {
  constructor(options = {}) {
    super(content, {
      cssClass: ['modal-add-promo-code'],
      ...options
    })

    this.init()
  }

  init() {
    if (!this.modalBody) return
    this.selects = new Select({ uniqueName: 'select-modal-add-promo-code', parentEl: this.modalBody })

    this.form = this.modalBody.querySelector('.form-add-promo-code')
    this.btnAddPromoCode = this.modalBody.querySelector('.btn-add-promo-code')
    this.validator = validate(this.form, { container: this.modalBody })

    this.events()
  }

  events() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this))
    this.btnAddPromoCode.addEventListener('click', this.handleSubmit.bind(this))
  }

  handleSubmit() {
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(this.form)
      let data = {}

      Array.from(formData).forEach(arr => {
        const key = arr[0];
        let value = arr[1];

        if (key === 'only_first_pay' || key === 'deposit_included' || key === 'sales_type') {
          value = parseInt(value) || 0;
        } else if (key === 'sale_value') {
          value = parseFloat(value.replace(/\s/g, '').replace(',', '.')) || 0;
        }

        data[key] = value;
      })

      this.addPromoCodeRequest(data)
        .then(({ msg, msg_type }) => {
          if (msg_type === 'success') {
            this.close()
            window.location.reload()
          }
        })
        .finally(() => {
          this.validator.refresh()
          this.form.reset()
        })
    })
  }

  onOpen(params = null) {
    // Reset form when modal opens
    if (this.form) {
      this.form.reset()
    }
  }

  onClose() {
    if (this.form) {
      this.form.reset()
    }
  }

  async addPromoCodeRequest(data) {
    try {
      this.loader.enable()
      const response = await addPromoCode(data)
      if (response && response.msg) {
        outputInfo(response)
      }
      return response
    } catch (error) {
      console.error(error)
      return { msg_type: 'error' }
    } finally {
      this.loader.disable()
    }
  }
}

const modalAddPromoCode = new ModalAddPromoCode()

export default modalAddPromoCode