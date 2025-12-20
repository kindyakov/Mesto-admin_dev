import BaseModal from "../BaseModal.js"
import content from "./content.html"
// import { validate } from "./validate.js";

import { Select } from "../../../modules/mySelect.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { api } from "../../../settings/api.js";
import { dateFormatter } from "../../../settings/dateFormatter.js";

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

    this.events()
  }

  events() {

  }

  handleSubmit() {


  }

  onClose() {
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

const modalAddPromoCode = new ModalAddPromoCode()

export default modalAddPromoCode